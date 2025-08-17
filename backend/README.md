# TestimonialFlow FastAPI Backend

A FastAPI backend for TestimonialFlow that handles testimonial submissions with Supabase integration.

## Features

- **Testimonial Submission**: Accept testimonials with optional video uploads
- **Supabase Integration**: Uses Supabase for database and file storage
- **Input Validation**: Ensures data integrity with proper validation
- **RESTful API**: Clean, documented endpoints
- **CORS Support**: Configured for cross-origin requests

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the `api/` directory with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase Setup

Ensure you have:
- A Supabase project with the `testimonials` table
- A storage bucket named `testimonials` for video uploads
- The service role key (not the anon key) for server-side operations

### 4. Database Schema

The `testimonials` table should have this structure:

```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100),
  text TEXT,
  video_url VARCHAR(255),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

## Running the API

### Development

```bash
python main.py
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### With Docker

```bash
docker build -t testimonialflow-api .
docker run -p 8000:8000 --env-file .env testimonialflow-api
```

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check with database connection test

### Testimonials
- `POST /submit-testimonial` - Submit a new testimonial
- `GET /testimonials/{user_id}` - Get testimonials for a user
- `PUT /testimonials/{testimonial_id}/approve` - Approve a testimonial
- `DELETE /testimonials/{testimonial_id}` - Delete a testimonial

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Example Usage

### Submit a Testimonial

```bash
curl -X POST "http://localhost:8000/submit-testimonial" \
  -H "Content-Type: multipart/form-data" \
  -F "user_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "name=John Doe" \
  -F "text=Great service! Highly recommend." \
  -F "video=@testimonial.mp4"
```

### Get Testimonials

```bash
curl "http://localhost:8000/testimonials/123e4567-e89b-12d3-a456-426614174000"
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failures)

## Security Notes

- Uses service role key for database operations (server-side only)
- Input validation prevents injection attacks
- File type validation for video uploads
- CORS configured for development (restrict in production)

## Development

### Adding New Endpoints

1. Define the endpoint function with proper validation
2. Add error handling
3. Update this README
4. Test with the provided examples

### Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest
```

## License

This project is part of TestimonialFlow.
