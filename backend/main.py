from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime, timedelta
import os
import uuid
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from notification_service import NotificationService

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
    rating: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    allow_sharing: Optional[bool] = Form(True),
    video: Optional[UploadFile] = File(None),
    photo: Optional[UploadFile] = File(None)
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
        
        # Handle photo upload if provided
        photo_url = None
        if photo and photo.filename:
            # Validate photo file
            valid_photo_types = ['image/jpeg', 'image/png', 'image/webp']
            valid_photo_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            file_extension = '.' + photo.filename.split('.')[-1].lower() if photo.filename and '.' in photo.filename else ''
            
            if file_extension not in valid_photo_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"Photo file type '{file_extension}' is not supported. Please use JPEG, PNG, or WebP format."
                )
            
            if photo.content_type and photo.content_type not in valid_photo_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Photo file type '{photo.content_type}' is not supported. Please use JPEG, PNG, or WebP format."
                )
            
            try:
                file_content = await photo.read()
                
                if not file_content:
                    raise HTTPException(
                        status_code=400,
                        detail="Photo file appears to be empty. Please select a valid photo file."
                    )
                
                # Check file size (5MB limit for photos)
                if len(file_content) > 5242880:  # 5MB in bytes
                    file_size_mb = len(file_content) / (1024 * 1024)
                    raise HTTPException(
                        status_code=413,
                        detail=f"Photo file is too large ({file_size_mb:.1f}MB). Maximum size allowed is 5MB."
                    )
                
                # Generate safe filename
                safe_extension = file_extension if file_extension in valid_photo_extensions else '.jpg'
                filename = f"photos/{testimonial_id}{safe_extension}"
                
                # Upload to testimonial-photos bucket
                try:
                    storage_response = supabase.storage.from_('testimonial-photos').upload(
                        path=filename,
                        file=file_content,
                        file_options={"content-type": photo.content_type or "image/jpeg"}
                    )
                    
                    if hasattr(storage_response, 'error') and storage_response.error:
                        raise HTTPException(
                            status_code=500,
                            detail=f"Failed to upload photo: {storage_response.error}"
                        )
                    
                    photo_url = f"{SUPABASE_URL}/storage/v1/object/public/testimonial-photos/{filename}"
                    
                except Exception as storage_error:
                    if "already exists" in str(storage_error).lower():
                        photo_url = f"{SUPABASE_URL}/storage/v1/object/public/testimonial-photos/{filename}"
                    else:
                        raise HTTPException(
                            status_code=500,
                            detail=f"Failed to upload photo: {str(storage_error)}"
                        )
                        
            except HTTPException:
                raise
            except Exception as file_error:
                print(f"Photo processing error: {str(file_error)}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to process photo file. Please check the file format and try again."
                )

        # Insert testimonial into database
        testimonial_data = {
            "id": testimonial_id,
            "user_id": user_id,
            "name": name,
            "text": text,
            "rating": rating,
            "category": category,
            "email": email,
            "allow_sharing": allow_sharing,
            "video_url": video_url,
            "photo_url": photo_url,
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
            
            # Trigger notification for new testimonial
            try:
                notification_service = NotificationService(supabase)
                notification_data = {
                    "name": name,
                    "text": text,
                    "id": testimonial_id
                }
                await notification_service.trigger_new_testimonial_notification(user_id, notification_data)
            except Exception as notification_error:
                print(f"Notification error (non-blocking): {str(notification_error)}")
                # Don't fail the testimonial submission if notification fails
            
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

@app.put("/testimonials/{testimonial_id}/reject")
async def reject_testimonial(testimonial_id: str):
    """
    Reject a testimonial
    
    Args:
        testimonial_id: The UUID of the testimonial to reject
    
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('testimonials').update(
            {"approved": False}
        ).eq('id', testimonial_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to reject testimonial: {response.status_code}"
            )
        
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Testimonial not found"
            )
        
        return {
            "success": True,
            "message": "Testimonial rejected successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in reject_testimonial: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while rejecting the testimonial"
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

# Automation Rules Endpoints

@app.get("/automation/rules/{user_id}")
async def get_automation_rules(user_id: str):
    """
    Get all automation rules for a user
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        List of automation rules
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('automation_rules').select('*').eq('user_id', user_id).order('priority', desc=True).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch automation rules: {response.status_code}"
            )
        
        return {
            "success": True,
            "rules": response.data or []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in get_automation_rules: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching automation rules"
        )

@app.post("/automation/rules")
async def create_automation_rule(
    user_id: str,
    name: str,
    description: str,
    type: str,
    conditions: list,
    actions: list,
    priority: int = 1,
    enabled: bool = True
):
    """
    Create a new automation rule
    
    Args:
        user_id: The UUID of the user
        name: Rule name
        description: Rule description
        type: Rule type (auto_approval, spam_detection, categorization)
        conditions: List of rule conditions
        actions: List of rule actions
        priority: Rule priority (1-10)
        enabled: Whether the rule is enabled
    
    Returns:
        Created rule
    """
    try:
        supabase = get_supabase_client()
        
        rule_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": name,
            "description": description,
            "type": type,
            "conditions": conditions,
            "actions": actions,
            "priority": priority,
            "enabled": enabled,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table('automation_rules').insert(rule_data).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create automation rule: {response.status_code}"
            )
        
        return {
            "success": True,
            "rule": response.data[0] if response.data else rule_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in create_automation_rule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the automation rule"
        )

@app.put("/automation/rules/{rule_id}")
async def update_automation_rule(
    rule_id: str,
    name: str,
    description: str,
    type: str,
    conditions: list,
    actions: list,
    priority: int,
    enabled: bool
):
    """
    Update an automation rule
    
    Args:
        rule_id: The UUID of the rule to update
        name: Rule name
        description: Rule description
        type: Rule type
        conditions: List of rule conditions
        actions: List of rule actions
        priority: Rule priority
        enabled: Whether the rule is enabled
    
    Returns:
        Updated rule
    """
    try:
        supabase = get_supabase_client()
        
        update_data = {
            "name": name,
            "description": description,
            "type": type,
            "conditions": conditions,
            "actions": actions,
            "priority": priority,
            "enabled": enabled,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table('automation_rules').update(update_data).eq('id', rule_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update automation rule: {response.status_code}"
            )
        
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Automation rule not found"
            )
        
        return {
            "success": True,
            "rule": response.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in update_automation_rule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while updating the automation rule"
        )

@app.put("/automation/rules/{rule_id}/toggle")
async def toggle_automation_rule(rule_id: str, enabled: bool):
    """
    Toggle automation rule enabled status
    
    Args:
        rule_id: The UUID of the rule to toggle
        enabled: Whether to enable or disable the rule
    
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('automation_rules').update({
            "enabled": enabled,
            "updated_at": datetime.utcnow().isoformat()
        }).eq('id', rule_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to toggle automation rule: {response.status_code}"
            )
        
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Automation rule not found"
            )
        
        return {
            "success": True,
            "message": f"Rule {'enabled' if enabled else 'disabled'} successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in toggle_automation_rule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while toggling the automation rule"
        )

@app.delete("/automation/rules/{rule_id}")
async def delete_automation_rule(rule_id: str):
    """
    Delete an automation rule
    
    Args:
        rule_id: The UUID of the rule to delete
    
    Returns:
        Success message
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('automation_rules').delete().eq('id', rule_id).execute()
        
        if hasattr(response, 'status_code') and response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete automation rule: {response.status_code}"
            )
        
        return {
            "success": True,
            "message": "Automation rule deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in delete_automation_rule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting the automation rule"
        )

@app.post("/automation/rules/{rule_id}/test")
async def test_automation_rule(rule_id: str, testimonial_data: dict):
    """
    Test an automation rule against sample testimonial data
    
    Args:
        rule_id: The UUID of the rule to test
        testimonial_data: Sample testimonial data to test against
    
    Returns:
        Test results
    """
    try:
        supabase = get_supabase_client()
        
        # Get the rule
        rule_response = supabase.table('automation_rules').select('*').eq('id', rule_id).execute()
        
        if not rule_response.data:
            raise HTTPException(
                status_code=404,
                detail="Automation rule not found"
            )
        
        rule = rule_response.data[0]
        
        # Test the rule conditions
        conditions_met = evaluate_rule_conditions(rule['conditions'], testimonial_data)
        
        # Determine actions to take
        actions_to_execute = rule['actions'] if conditions_met else []
        
        return {
            "success": True,
            "rule_matched": conditions_met,
            "conditions_evaluated": rule['conditions'],
            "actions_to_execute": actions_to_execute,
            "testimonial_data": testimonial_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in test_automation_rule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while testing the automation rule"
        )

def evaluate_rule_conditions(conditions: list, testimonial_data: dict) -> bool:
    """
    Evaluate rule conditions against testimonial data
    
    Args:
        conditions: List of rule conditions
        testimonial_data: Testimonial data to evaluate against
    
    Returns:
        True if all conditions are met, False otherwise
    """
    if not conditions:
        return True
    
    result = True
    logical_operator = 'AND'
    
    for i, condition in enumerate(conditions):
        if i > 0 and 'logical_operator' in condition:
            logical_operator = condition['logical_operator']
        
        condition_result = evaluate_single_condition(condition, testimonial_data)
        
        if logical_operator == 'AND':
            result = result and condition_result
        else:  # OR
            result = result or condition_result
    
    return result

def evaluate_single_condition(condition: dict, testimonial_data: dict) -> bool:
    """
    Evaluate a single condition against testimonial data
    
    Args:
        condition: Single rule condition
        testimonial_data: Testimonial data to evaluate against
    
    Returns:
        True if condition is met, False otherwise
    """
    field = condition.get('field', '')
    operator = condition.get('operator', 'equals')
    value = condition.get('value', '')
    
    # Get the actual value from testimonial data
    actual_value = testimonial_data.get(field, '')
    
    # Handle special fields
    if field == 'text_length':
        actual_value = len(testimonial_data.get('text', ''))
        value = int(value) if value.isdigit() else 0
    
    # Convert to strings for comparison
    actual_value_str = str(actual_value).lower()
    value_str = str(value).lower()
    
    try:
        if operator == 'equals':
            return actual_value_str == value_str
        elif operator == 'contains':
            return value_str in actual_value_str
        elif operator == 'starts_with':
            return actual_value_str.startswith(value_str)
        elif operator == 'ends_with':
            return actual_value_str.endswith(value_str)
        elif operator == 'greater_than':
            return float(actual_value) > float(value)
        elif operator == 'less_than':
            return float(actual_value) < float(value)
        elif operator == 'regex':
            import re
            return bool(re.search(value, actual_value_str))
        else:
            return False
    except (ValueError, TypeError):
        return False

@app.get("/automation/stats/{user_id}")
async def get_automation_stats(user_id: str):
    """
    Get automation statistics for a user
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        Automation statistics
    """
    try:
        supabase = get_supabase_client()
        
        # Get total rules
        rules_response = supabase.table('automation_rules').select('id, enabled').eq('user_id', user_id).execute()
        total_rules = len(rules_response.data or [])
        active_rules = len([r for r in (rules_response.data or []) if r.get('enabled', False)])
        
        # Get rules executed count from logs
        logs_response = supabase.table('automation_logs').select('id').eq('user_id', user_id).execute()
        rules_executed = len(logs_response.data or [])
        
        # Calculate automation rate (percentage of testimonials processed by automation)
        testimonials_response = supabase.table('testimonials').select('id').eq('user_id', user_id).execute()
        total_testimonials = len(testimonials_response.data or [])
        
        automation_rate = 0
        if total_testimonials > 0:
            automation_rate = round((rules_executed / total_testimonials) * 100, 1)
        
        return {
            "totalRules": total_rules,
            "activeRules": active_rules,
            "rulesExecuted": rules_executed,
            "automationRate": automation_rate
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in get_automation_stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching automation statistics"
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

# Analytics Endpoints
@app.get("/analytics/{user_id}/stats")
async def get_analytics_stats(user_id: str):
    """
    Get comprehensive analytics statistics for a user
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        Analytics statistics including totals, rates, and trends
    """
    try:
        supabase = get_supabase_client()
        
        # Get all testimonials for the user
        response = supabase.table('testimonials').select('*').eq('user_id', user_id).execute()
        testimonials = response.data or []
        
        if not testimonials:
            return {
                "success": True,
                "stats": {
                    "totalTestimonials": 0,
                    "approvedTestimonials": 0,
                    "pendingTestimonials": 0,
                    "thisMonth": 0,
                    "approvalRate": 0,
                    "growthRate": 0,
                    "averageResponseTime": 0,
                    "totalViews": 0,
                    "monthlyTrends": [],
                    "approvalTrends": []
                }
            }
        
        # Calculate basic stats
        total_testimonials = len(testimonials)
        approved_testimonials = len([t for t in testimonials if t.get('approved', False)])
        pending_testimonials = total_testimonials - approved_testimonials
        approval_rate = (approved_testimonials / total_testimonials * 100) if total_testimonials > 0 else 0
        
        # Calculate this month's testimonials
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        this_month = 0
        for t in testimonials:
            try:
                created_date = datetime.fromisoformat(t['created_at'].replace('Z', '+00:00'))
                if created_date.month == current_month and created_date.year == current_year:
                    this_month += 1
            except (ValueError, TypeError, KeyError):
                continue
        
        # Calculate growth rate (comparing to previous month)
        previous_month = current_month - 1 if current_month > 1 else 12
        previous_year = current_year if current_month > 1 else current_year - 1
        previous_month_count = 0
        for t in testimonials:
            try:
                created_date = datetime.fromisoformat(t['created_at'].replace('Z', '+00:00'))
                if created_date.month == previous_month and created_date.year == previous_year:
                    previous_month_count += 1
            except (ValueError, TypeError, KeyError):
                continue
        
        growth_rate = 0
        if previous_month_count > 0:
            growth_rate = ((this_month - previous_month_count) / previous_month_count) * 100
        elif this_month > 0:
            growth_rate = 100  # New growth
        
        # Calculate average response time (time between creation and approval)
        approved_with_dates = []
        total_response_time = 0
        
        for testimonial in testimonials:
            if (testimonial.get('approved', False) and 
                testimonial.get('created_at') and 
                testimonial.get('updated_at')):
                try:
                    created = datetime.fromisoformat(testimonial['created_at'].replace('Z', '+00:00'))
                    updated = datetime.fromisoformat(testimonial['updated_at'].replace('Z', '+00:00'))
                    response_time = (updated - created).days
                    total_response_time += response_time
                    approved_with_dates.append(testimonial)
                except (ValueError, TypeError):
                    continue
        
        average_response_time = total_response_time / len(approved_with_dates) if approved_with_dates else 0
        
        # Calculate monthly trends (last 6 months)
        monthly_trends = []
        for i in range(6):
            month = current_month - i
            year = current_year
            if month <= 0:
                month += 12
                year -= 1
            
            month_count = 0
            for t in testimonials:
                try:
                    created_date = datetime.fromisoformat(t['created_at'].replace('Z', '+00:00'))
                    if created_date.month == month and created_date.year == year:
                        month_count += 1
                except (ValueError, TypeError, KeyError):
                    continue
            
            monthly_trends.append({
                "month": f"{year}-{month:02d}",
                "count": month_count
            })
        
        monthly_trends.reverse()  # Show oldest first
        
        # Calculate approval trends (last 6 months)
        approval_trends = []
        for i in range(6):
            month = current_month - i
            year = current_year
            if month <= 0:
                month += 12
                year -= 1
            
            month_testimonials = []
            for t in testimonials:
                try:
                    created_date = datetime.fromisoformat(t['created_at'].replace('Z', '+00:00'))
                    if created_date.month == month and created_date.year == year:
                        month_testimonials.append(t)
                except (ValueError, TypeError, KeyError):
                    continue
            
            month_approved = len([t for t in month_testimonials if t.get('approved', False)])
            month_rate = (month_approved / len(month_testimonials) * 100) if month_testimonials else 0
            
            approval_trends.append({
                "month": f"{year}-{month:02d}",
                "rate": round(month_rate, 1)
            })
        
        approval_trends.reverse()  # Show oldest first
        
        # Mock total views (in real app, this would come from analytics tracking)
        total_views = total_testimonials * 6  # Rough estimate
        
        return {
            "success": True,
            "stats": {
                "totalTestimonials": total_testimonials,
                "approvedTestimonials": approved_testimonials,
                "pendingTestimonials": pending_testimonials,
                "thisMonth": this_month,
                "approvalRate": round(approval_rate, 1),
                "growthRate": round(growth_rate, 1),
                "averageResponseTime": round(average_response_time, 1),
                "totalViews": total_views,
                "monthlyTrends": monthly_trends,
                "approvalTrends": approval_trends
            }
        }
        
    except Exception as e:
        print(f"Error getting analytics stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get analytics stats: {str(e)}"
        )

@app.get("/analytics/{user_id}/timeline")
async def get_analytics_timeline(user_id: str, days: int = 30):
    """
    Get timeline data for analytics charts
    
    Args:
        user_id: The UUID of the user
        days: Number of days to look back (default 30)
    
    Returns:
        Timeline data for charts
    """
    try:
        supabase = get_supabase_client()
        
        # Get testimonials from the last N days
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        response = supabase.table('testimonials').select('*').eq('user_id', user_id).gte('created_at', cutoff_date.isoformat()).execute()
        testimonials = response.data or []
        
        # Group by date
        timeline_data = {}
        for testimonial in testimonials:
            try:
                date = datetime.fromisoformat(testimonial['created_at'].replace('Z', '+00:00')).strftime('%Y-%m-%d')
                if date not in timeline_data:
                    timeline_data[date] = {
                        "date": date,
                        "total": 0,
                        "approved": 0,
                        "pending": 0
                    }
                
                timeline_data[date]["total"] += 1
                if testimonial.get('approved', False):
                    timeline_data[date]["approved"] += 1
                else:
                    timeline_data[date]["pending"] += 1
            except (ValueError, TypeError, KeyError):
                continue
        
        # Convert to sorted list
        timeline_list = sorted(timeline_data.values(), key=lambda x: x['date'])
        
        return {
            "success": True,
            "timeline": timeline_list
        }
        
    except Exception as e:
        print(f"Error getting analytics timeline: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get analytics timeline: {str(e)}"
        )

# Notification endpoints
@app.get("/notifications/preferences/{user_id}")
async def get_notification_preferences(user_id: str):
    """
    Get notification preferences for a user
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        User's notification preferences
    """
    try:
        supabase = get_supabase_client()
        notification_service = NotificationService(supabase)
        
        result = await notification_service.get_notification_preferences(user_id)
        
        if result['success']:
            return result
        else:
            raise HTTPException(
                status_code=404,
                detail=result['error']
            )
            
    except Exception as e:
        print(f"Error getting notification preferences: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get notification preferences: {str(e)}"
        )

@app.put("/notifications/preferences/{user_id}")
async def update_notification_preferences(user_id: str, preferences: Dict[str, Any]):
    """
    Update notification preferences for a user
    
    Args:
        user_id: The UUID of the user
        preferences: Updated preferences data
    
    Returns:
        Updated notification preferences
    """
    try:
        supabase = get_supabase_client()
        notification_service = NotificationService(supabase)
        
        result = await notification_service.update_notification_preferences(user_id, preferences)
        
        if result['success']:
            return result
        else:
            raise HTTPException(
                status_code=400,
                detail=result['error']
            )
            
    except Exception as e:
        print(f"Error updating notification preferences: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update notification preferences: {str(e)}"
        )

@app.post("/notifications/test/{user_id}")
async def test_notification(user_id: str, notification_type: str = "new_testimonial"):
    """
    Test notification system for a user
    
    Args:
        user_id: The UUID of the user
        notification_type: Type of notification to test
    
    Returns:
        Test result
    """
    try:
        supabase = get_supabase_client()
        notification_service = NotificationService(supabase)
        
        if notification_type == "new_testimonial":
            test_data = {
                "name": "Test User",
                "text": "This is a test testimonial for notification testing.",
                "id": str(uuid.uuid4())
            }
            result = await notification_service.trigger_new_testimonial_notification(user_id, test_data)
        elif notification_type == "weekly_summary":
            result = await notification_service.send_weekly_summary(user_id)
        elif notification_type == "pending_reminder":
            result = await notification_service.send_pending_reminder(user_id)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid notification type: {notification_type}"
            )
        
        if result['success']:
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail=result['error']
            )
            
    except Exception as e:
        print(f"Error testing notification: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to test notification: {str(e)}"
        )

@app.get("/notifications/logs/{user_id}")
async def get_notification_logs(user_id: str, limit: int = 50):
    """
    Get notification logs for a user
    
    Args:
        user_id: The UUID of the user
        limit: Maximum number of logs to return
    
    Returns:
        Notification logs
    """
    try:
        supabase = get_supabase_client()
        notification_service = NotificationService(supabase)
        
        result = await notification_service.get_notification_logs(user_id, limit)
        
        if result['success']:
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail=result['error']
            )
            
    except Exception as e:
        print(f"Error getting notification logs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get notification logs: {str(e)}"
        )

@app.post("/notifications/unsubscribe")
async def unsubscribe_from_notifications(email: str):
    """
    Unsubscribe user from all notifications
    
    Args:
        email: User's email address
    
    Returns:
        Unsubscribe result
    """
    try:
        supabase = get_supabase_client()
        notification_service = NotificationService(supabase)
        
        result = await notification_service.unsubscribe_user(email)
        
        if result['success']:
            return result
        else:
            raise HTTPException(
                status_code=404,
                detail=result['error']
            )
            
    except Exception as e:
        print(f"Error unsubscribing user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to unsubscribe: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)