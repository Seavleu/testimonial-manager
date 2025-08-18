from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
import os
import uuid
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="TestimonialFlow API",
    description="Backend API for TestimonialFlow - Collect and manage customer testimonials",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frontend.testimonialflow.com", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")

# Lazy Supabase client initialization
_supabase_client = None

def get_supabase_client() -> Client:
    """Get Supabase client with lazy initialization"""
    global _supabase_client
    if _supabase_client is None:
        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        except Exception as e:
            print(f"Failed to create Supabase client: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail=f"Database connection failed: {str(e)}"
            )
    return _supabase_client

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "TestimonialFlow API is running",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Test Supabase connection
        supabase = get_supabase_client()
        response = supabase.table('testimonials').select('id').limit(1).execute()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat(),
            "supabase_url": SUPABASE_URL[:50] + "..." if SUPABASE_URL else "Not set"
        }
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.post("/submit-testimonial")
async def submit_testimonial(
    user_id: str = Form(...),
    name: str = Form(...),
    text: str = Form(...),
    video: Optional[UploadFile] = File(None)
):
    """
    Submit a new testimonial
    
    Args:
        user_id: The UUID of the user submitting the testimonial
        name: The name of the person giving the testimonial (max 100 chars)
        text: The testimonial text (10-500 chars)
        video: Optional video file upload
    
    Returns:
        JSON response with success message and testimonial ID
    """
    
    # Validate user_id format (basic UUID check)
    try:
        uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format. Please use a valid collection link."
        )
    
    # Validate and sanitize input
    name = name.strip()
    text = text.strip()
    
    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required and cannot be empty."
        )
    
    if not text:
        raise HTTPException(
            status_code=400,
            detail="Testimonial text is required and cannot be empty."
        )
    
    # Validate input lengths
    if len(name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Name is too long. Please limit to 100 characters or less."
        )
    
    if len(text) > 500:
        raise HTTPException(
            status_code=400,
            detail="Testimonial is too long. Please limit to 500 characters or less."
        )
        
    if len(text) < 10:
        raise HTTPException(
            status_code=400,
            detail="Testimonial is too short. Please write at least 10 characters."
        )
    
    try:
        supabase = get_supabase_client()
        
        # Generate unique ID for the testimonial
        testimonial_id = str(uuid.uuid4())
        video_url = None
        
        # Handle video upload if provided
        if video and video.filename:
            # Validate video file - accept common video MIME types
            valid_video_types = [
                'video/mp4',
                'video/mpeg',
                'video/quicktime',  # .mov files
                'video/webm',
                'video/x-msvideo',  # .avi files
                'video/x-ms-wmv',   # .wmv files
            ]
            
            # Also check file extension as backup
            valid_extensions = ['.mp4', '.mov', '.avi', '.wmv', '.webm', '.mpeg', '.mpg']
            file_extension = '.' + video.filename.split('.')[-1].lower() if video.filename and '.' in video.filename else ''
            
            # Detailed validation with specific error messages
            if not video.filename:
                raise HTTPException(
                    status_code=400,
                    detail="Video file appears to be corrupted or empty. Please select a valid video file."
                )
            
            if not file_extension:
                raise HTTPException(
                    status_code=400,
                    detail="Video file must have a valid extension. Please use .mp4, .mov, .webm, or .avi files."
                )
            
            if file_extension not in valid_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"Video file type '{file_extension}' is not supported. Please use MP4, MOV, WebM, or AVI format."
                )
            
            if video.content_type and video.content_type not in valid_video_types and not video.content_type.startswith('video/'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File type '{video.content_type}' is not a valid video format. Please use MP4, MOV, WebM, or AVI format."
                )
            
            try:
                # Read file content
                file_content = await video.read()
                
                if not file_content:
                    raise HTTPException(
                        status_code=400,
                        detail="Video file appears to be empty. Please select a valid video file."
                    )
                
                # Check file size (50MB limit as per migration)
                if len(file_content) > 52428800:  # 50MB in bytes
                    file_size_mb = len(file_content) / (1024 * 1024)
                    raise HTTPException(
                        status_code=413,
                        detail=f"Video file is too large ({file_size_mb:.1f}MB). Maximum size allowed is 50MB. Please compress your video or choose a smaller file."
                    )
                
                # Generate safe filename
                safe_extension = file_extension if file_extension in valid_extensions else '.mp4'
                filename = f"videos/{testimonial_id}{safe_extension}"
                
                # Upload to testimonial-videos bucket
                try:
                    print(f"Uploading file: {filename} ({len(file_content)} bytes)")
                    
                    storage_response = supabase.storage.from_('testimonial-videos').upload(
                        path=filename,
                        file=file_content,
                        file_options={"content-type": video.content_type or "video/mp4"}
                    )
                    
                    print(f"Upload response: {storage_response}")
                    
                    # Check if upload was successful
                    if hasattr(storage_response, 'error') and storage_response.error:
                        print(f"Upload error: {storage_response.error}")
                        raise HTTPException(
                            status_code=500,
                            detail=f"Failed to upload video: {storage_response.error}"
                        )
                    
                    # Always construct the URL manually for reliability
                    video_url = f"{SUPABASE_URL}/storage/v1/object/public/testimonial-videos/{filename}"
                    print(f"Generated video URL: {video_url}")
                    
                except Exception as storage_error:
                    print(f"Storage error: {str(storage_error)}")
                    if "already exists" in str(storage_error).lower():
                        # File already exists, construct URL anyway
                        video_url = f"{SUPABASE_URL}/storage/v1/object/public/testimonial-videos/{filename}"
                        print(f"File exists, using URL: {video_url}")
                    else:
                        raise HTTPException(
                            status_code=500,
                            detail=f"Failed to upload video: {str(storage_error)}"
                        )
                        
            except HTTPException:
                raise
            except Exception as file_error:
                print(f"File processing error: {str(file_error)}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to process video file. Please check the file format and try again."
                )
        
        # Insert testimonial into database
        testimonial_data = {
            "id": testimonial_id,
            "user_id": user_id,
            "name": name,
            "text": text,
            "video_url": video_url,
            "approved": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        try:
            db_response = supabase.table('testimonials').insert(testimonial_data).execute()
            
            if hasattr(db_response, 'status_code') and db_response.status_code >= 400:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to save testimonial: {db_response.status_code}"
                )
            
            return {
                "success": True,
                "message": "Testimonial submitted successfully",
                "testimonial_id": testimonial_id,
                "video_url": video_url
            }
            
        except HTTPException:
            raise
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save testimonial to database. Please try again."
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in submit_testimonial: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while submitting the testimonial"
        )

@app.get("/testimonials/{user_id}")
async def get_testimonials(user_id: str, approved_only: bool = False):
    """
    Get testimonials for a specific user
    
    Args:
        user_id: The UUID of the user
        approved_only: If True, only return approved testimonials
    
    Returns:
        List of testimonials
    """
    try:
        supabase = get_supabase_client()
        
        query = supabase.table('testimonials').select('*').eq('user_id', user_id)
        
        if approved_only:
            query = query.eq('approved', True)
        
        response = query.order('created_at', desc=True).execute()
        
        # Return empty list if no testimonials found
        return {
            "success": True,
            "testimonials": response.data or [],
            "count": len(response.data or [])
        }
        
    except Exception as e:
        print(f"Unexpected error in get_testimonials: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while fetching testimonials: {str(e)}"
        )
        
@app.put("/testimonials/{testimonial_id}/approve")
async def approve_testimonial(testimonial_id: str):
    """
    Approve a testimonial
    
    Args:
        testimonial_id: The UUID of the testimonial to approve
    
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('testimonials').update(
            {"approved": True}
        ).eq('id', testimonial_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to approve testimonial: {response.status_code}"
            )
        
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Testimonial not found"
            )
        
        return {
            "success": True,
            "message": "Testimonial approved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in approve_testimonial: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while approving the testimonial"
        )

@app.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str):
    """
    Delete a testimonial
    
    Args:
        testimonial_id: The UUID of the testimonial to delete
    
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_client()
        
        # First, get the testimonial to check if it has a video
        get_response = supabase.table('testimonials').select('video_url').eq('id', testimonial_id).execute()
        
        if hasattr(get_response, 'status_code') and get_response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch testimonial: {get_response.status_code}"
            )
        
        if not get_response.data:
            raise HTTPException(
                status_code=404,
                detail="Testimonial not found"
            )
        
        # Delete video from storage if it exists
        testimonial = get_response.data[0]
        if testimonial.get('video_url'):
            try:
                # Extract filename from URL and delete from storage
                video_filename = testimonial['video_url'].split('/')[-1]
                supabase.storage.from_('testimonial-videos').remove([video_filename])
            except Exception as e:
                print(f"Warning: Failed to delete video file: {str(e)}")
        
        # Delete from database
        delete_response = supabase.table('testimonials').delete().eq('id', testimonial_id).execute()
        
        if hasattr(delete_response, 'status_code') and delete_response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete testimonial: {delete_response.status_code}"
            )
        
        return {
            "success": True,
            "message": "Testimonial deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in delete_testimonial: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting the testimonial"
        )

@app.get("/personal-message/{user_id}")
async def get_personal_message(user_id: str):
    """
    Get the personal message for a user (for display on collection page)
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        Personal message data or null if not found/not visible
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('personal_messages').select('*').eq('user_id', user_id).eq('is_visible', True).limit(1).execute()
        
        return {
            "success": True,
            "message": response.data[0] if response.data else None
        }
        
    except Exception as e:
        print(f"Error getting personal message: {str(e)}")
        return {
            "success": True,
            "message": None
        }

@app.get("/personal-messages/{user_id}")
async def get_user_personal_messages(user_id: str):
    """
    Get all personal messages for a user (for dashboard management)
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        List of personal messages
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('personal_messages').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        
        return {
            "success": True,
            "messages": response.data or []
        }
        
    except Exception as e:
        print(f"Error getting personal messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch personal messages: {str(e)}"
        )

@app.post("/personal-messages")
async def create_personal_message(
    user_id: str = Form(...),
    title: str = Form(...),
    message: str = Form(...),
    is_visible: bool = Form(True)
):
    """
    Create a new personal message
    
    Args:
        user_id: The UUID of the user
        title: The title of the message (max 100 chars)
        message: The message content (max 500 chars)
        is_visible: Whether the message should be visible on collection page
    
    Returns:
        Success message with created message data
    """
    # Validate input
    title = title.strip()
    message = message.strip()
    
    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title is required."
        )
    
    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message content is required."
        )
    
    if len(title) > 100:
        raise HTTPException(
            status_code=400,
            detail="Title must be 100 characters or less."
        )
    
    if len(message) > 500:
        raise HTTPException(
            status_code=400,
            detail="Message must be 500 characters or less."
        )
    
    try:
        supabase = get_supabase_client()
        
        # If setting as visible, hide other visible messages first (only one visible at a time)
        if is_visible:
            supabase.table('personal_messages').update({"is_visible": False}).eq('user_id', user_id).execute()
        
        message_data = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "is_visible": is_visible,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table('personal_messages').insert(message_data).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail="Failed to create personal message"
            )
        
        return {
            "success": True,
            "message": "Personal message created successfully",
            "data": response.data[0] if response.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating personal message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create personal message: {str(e)}"
        )

@app.put("/personal-messages/{message_id}")
async def update_personal_message(
    message_id: str,
    title: str = Form(...),
    message: str = Form(...),
    is_visible: bool = Form(True)
):
    """
    Update a personal message
    
    Args:
        message_id: The UUID of the message to update
        title: The title of the message (max 100 chars)
        message: The message content (max 500 chars)
        is_visible: Whether the message should be visible on collection page
    
    Returns:
        Success message
    """
    # Validate input
    title = title.strip()
    message = message.strip()
    
    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title is required."
        )
    
    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message content is required."
        )
    
    if len(title) > 100:
        raise HTTPException(
            status_code=400,
            detail="Title must be 100 characters or less."
        )
    
    if len(message) > 500:
        raise HTTPException(
            status_code=400,
            detail="Message must be 500 characters or less."
        )
    
    try:
        supabase = get_supabase_client()
        
        # Get the message first to get user_id
        get_response = supabase.table('personal_messages').select('user_id').eq('id', message_id).execute()
        
        if not get_response.data:
            raise HTTPException(
                status_code=404,
                detail="Personal message not found"
            )
        
        user_id = get_response.data[0]['user_id']
        
        # If setting as visible, hide other visible messages first
        if is_visible:
            supabase.table('personal_messages').update({"is_visible": False}).eq('user_id', user_id).execute()
        
        update_data = {
            "title": title,
            "message": message,
            "is_visible": is_visible,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table('personal_messages').update(update_data).eq('id', message_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail="Failed to update personal message"
            )
        
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Personal message not found"
            )
        
        return {
            "success": True,
            "message": "Personal message updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating personal message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update personal message: {str(e)}"
        )

@app.delete("/personal-messages/{message_id}")
async def delete_personal_message(message_id: str):
    """
    Delete a personal message
    
    Args:
        message_id: The UUID of the message to delete
    
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('personal_messages').delete().eq('id', message_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete personal message"
            )
        
        return {
            "success": True,
            "message": "Personal message deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting personal message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete personal message: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)