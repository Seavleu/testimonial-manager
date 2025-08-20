from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import logging
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ErrorResponse:
    """Standardized error response format"""
    
    def __init__(
        self,
        error_code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error response to dictionary"""
        return {
            "success": False,
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.details,
                "timestamp": self.timestamp
            }
        }

class ErrorCodes:
    """Standard error codes"""
    
    # Authentication errors
    UNAUTHORIZED = "UNAUTHORIZED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    
    # Authorization errors
    FORBIDDEN = "FORBIDDEN"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    
    # Validation errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    
    # Resource errors
    NOT_FOUND = "NOT_FOUND"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    TESTIMONIAL_NOT_FOUND = "TESTIMONIAL_NOT_FOUND"
    
    # Database errors
    DATABASE_ERROR = "DATABASE_ERROR"
    CONNECTION_ERROR = "CONNECTION_ERROR"
    QUERY_ERROR = "QUERY_ERROR"
    
    # Email errors
    EMAIL_ERROR = "EMAIL_ERROR"
    EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED"
    INVALID_EMAIL = "INVALID_EMAIL"
    
    # Rate limiting
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"
    
    # Server errors
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"

class ErrorMessages:
    """User-friendly error messages"""
    
    MESSAGES = {
        ErrorCodes.UNAUTHORIZED: "Authentication required. Please log in to continue.",
        ErrorCodes.INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
        ErrorCodes.TOKEN_EXPIRED: "Your session has expired. Please log in again.",
        ErrorCodes.FORBIDDEN: "You don't have permission to access this resource.",
        ErrorCodes.INSUFFICIENT_PERMISSIONS: "You don't have sufficient permissions for this action.",
        ErrorCodes.VALIDATION_ERROR: "The provided data is invalid. Please check your input.",
        ErrorCodes.INVALID_INPUT: "Invalid input provided. Please check your data.",
        ErrorCodes.MISSING_REQUIRED_FIELD: "Required field is missing. Please provide all required information.",
        ErrorCodes.NOT_FOUND: "The requested resource was not found.",
        ErrorCodes.RESOURCE_NOT_FOUND: "The requested resource does not exist.",
        ErrorCodes.USER_NOT_FOUND: "User not found. Please check the user ID.",
        ErrorCodes.TESTIMONIAL_NOT_FOUND: "Testimonial not found. Please check the testimonial ID.",
        ErrorCodes.DATABASE_ERROR: "Database error occurred. Please try again later.",
        ErrorCodes.CONNECTION_ERROR: "Unable to connect to the database. Please try again later.",
        ErrorCodes.QUERY_ERROR: "Database query failed. Please try again later.",
        ErrorCodes.EMAIL_ERROR: "Email service error occurred. Please try again later.",
        ErrorCodes.EMAIL_SEND_FAILED: "Failed to send email. Please try again later.",
        ErrorCodes.INVALID_EMAIL: "Invalid email address provided.",
        ErrorCodes.RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment and try again.",
        ErrorCodes.TOO_MANY_REQUESTS: "Rate limit exceeded. Please slow down your requests.",
        ErrorCodes.INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later.",
        ErrorCodes.SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later.",
        ErrorCodes.CONFIGURATION_ERROR: "Service configuration error. Please contact support."
    }
    
    @classmethod
    def get_message(cls, error_code: str) -> str:
        """Get user-friendly message for error code"""
        return cls.MESSAGES.get(error_code, "An unexpected error occurred.")

class CustomHTTPException(HTTPException):
    """Custom HTTP exception with standardized error format"""
    
    def __init__(
        self,
        error_code: str,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        self.error_code = error_code
        self.message = message or ErrorMessages.get_message(error_code)
        self.details = details or {}
        self.status_code = status_code
        
        super().__init__(status_code=status_code, detail=self.message)

def create_error_response(
    error_code: str,
    message: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = 500
) -> ErrorResponse:
    """Create standardized error response"""
    return ErrorResponse(
        error_code=error_code,
        message=message or ErrorMessages.get_message(error_code),
        details=details,
        status_code=status_code
    )

def log_error(error: Exception, request: Optional[Request] = None, context: Optional[Dict[str, Any]] = None):
    """Log error with context"""
    error_info = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "traceback": traceback.format_exc(),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if request:
        error_info.update({
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        })
    
    if context:
        error_info["context"] = context
    
    logger.error(f"Error occurred: {error_info}")

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled exceptions"""
    
    # Log the error
    log_error(exc, request)
    
    # Create standardized error response
    error_response = create_error_response(
        error_code=ErrorCodes.INTERNAL_SERVER_ERROR,
        message="An unexpected error occurred. Please try again later.",
        details={"request_id": str(request.url)},
        status_code=500
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.to_dict()
    )

def handle_validation_error(field_errors: Dict[str, Any]) -> ErrorResponse:
    """Handle validation errors"""
    details = {
        "field_errors": field_errors,
        "total_errors": len(field_errors)
    }
    
    return create_error_response(
        error_code=ErrorCodes.VALIDATION_ERROR,
        message="Please check your input and try again.",
        details=details,
        status_code=422
    )

def handle_database_error(error: Exception) -> ErrorResponse:
    """Handle database errors"""
    log_error(error, context={"error_type": "database_error"})
    
    return create_error_response(
        error_code=ErrorCodes.DATABASE_ERROR,
        message="Database error occurred. Please try again later.",
        details={"error_type": type(error).__name__},
        status_code=500
    )

def handle_email_error(error: Exception) -> ErrorResponse:
    """Handle email errors"""
    log_error(error, context={"error_type": "email_error"})
    
    return create_error_response(
        error_code=ErrorCodes.EMAIL_ERROR,
        message="Email service error occurred. Please try again later.",
        details={"error_type": type(error).__name__},
        status_code=500
    )

def handle_not_found_error(resource_type: str = "resource") -> ErrorResponse:
    """Handle not found errors"""
    return create_error_response(
        error_code=ErrorCodes.NOT_FOUND,
        message=f"The requested {resource_type} was not found.",
        status_code=404
    )

def handle_unauthorized_error() -> ErrorResponse:
    """Handle unauthorized errors"""
    return create_error_response(
        error_code=ErrorCodes.UNAUTHORIZED,
        message="Authentication required. Please log in to continue.",
        status_code=401
    )

def handle_forbidden_error() -> ErrorResponse:
    """Handle forbidden errors"""
    return create_error_response(
        error_code=ErrorCodes.FORBIDDEN,
        message="You don't have permission to access this resource.",
        status_code=403
    )

def handle_rate_limit_error() -> ErrorResponse:
    """Handle rate limit errors"""
    return create_error_response(
        error_code=ErrorCodes.RATE_LIMIT_EXCEEDED,
        message="Too many requests. Please wait a moment and try again.",
        status_code=429
    )

# Error monitoring and alerting
class ErrorMonitor:
    """Monitor errors and send alerts for critical issues"""
    
    def __init__(self):
        self.error_counts = {}
        self.alert_threshold = 10  # Alert after 10 errors of the same type
        self.alert_cooldown = 3600  # 1 hour cooldown between alerts
    
    def record_error(self, error_code: str, context: Optional[Dict[str, Any]] = None):
        """Record an error occurrence"""
        if error_code not in self.error_counts:
            self.error_counts[error_code] = {
                "count": 0,
                "last_alert": None,
                "contexts": []
            }
        
        self.error_counts[error_code]["count"] += 1
        
        if context:
            self.error_counts[error_code]["contexts"].append(context)
        
        # Check if we should send an alert
        self._check_alert_threshold(error_code)
    
    def _check_alert_threshold(self, error_code: str):
        """Check if error count exceeds threshold for alerting"""
        error_info = self.error_counts[error_code]
        
        if (error_info["count"] >= self.alert_threshold and 
            (error_info["last_alert"] is None or 
             (datetime.utcnow() - error_info["last_alert"]).seconds > self.alert_cooldown)):
            
            self._send_alert(error_code, error_info)
            error_info["last_alert"] = datetime.utcnow()
    
    def _send_alert(self, error_code: str, error_info: Dict[str, Any]):
        """Send alert for critical error"""
        alert_message = f"""
        🚨 Critical Error Alert
        
        Error Code: {error_code}
        Occurrence Count: {error_info["count"]}
        Time: {datetime.utcnow().isoformat()}
        
        Recent Contexts:
        {error_info["contexts"][-5:] if error_info["contexts"] else "No context available"}
        """
        
        logger.critical(alert_message)
        
        # In production, you would send this to your alerting system
        # (e.g., Slack, email, PagerDuty, etc.)
        print(f"ALERT: {alert_message}")

# Global error monitor instance
error_monitor = ErrorMonitor()
