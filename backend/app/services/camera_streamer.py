import cv2
import time
import logging
import numpy as np

logger = logging.getLogger("camera_streamer")

class CameraStreamer:
    def __init__(self, stream_url: str):
        self.stream_url = stream_url
        self.cap = None
        self.active = True

    def gen_frames(self):
        # Attempt to open video capture
        self.cap = cv2.VideoCapture(self.stream_url)
        
        # If stream_url is numeric, try parsing it as integer (for local webcams, e.g. 0)
        try:
            if self.stream_url.isdigit():
                self.cap.release()
                self.cap = cv2.VideoCapture(int(self.stream_url))
        except Exception:
            pass

        if not self.cap.isOpened():
            logger.error(f"Failed to open camera stream: {self.stream_url}")
            yield self.get_error_frame("Camera Offline")
            self.active = False
            return

        consecutive_failures = 0
        while self.active:
            success, frame = self.cap.read()
            if not success:
                consecutive_failures += 1
                logger.warning(f"Failed to read frame from camera. Failure count: {consecutive_failures}")
                
                if consecutive_failures > 50:
                    yield self.get_error_frame("Stream Connection Lost")
                    time.sleep(2.0)
                    # Re-initialize capture
                    self.cap.release()
                    self.cap = cv2.VideoCapture(self.stream_url)
                    consecutive_failures = 0
                else:
                    time.sleep(0.05)
                continue

            consecutive_failures = 0
            
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Limit rate to ~20-25fps to save bandwidth
            time.sleep(0.04)

        self.release()

    def get_error_frame(self, message: str):
        # Create a blank black frame with message
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(
            img, 
            message, 
            (120, 240), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            1, 
            (0, 0, 255), 
            2, 
            cv2.LINE_AA
        )
        ret, buffer = cv2.imencode('.jpg', img)
        return b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n'

    def release(self):
        self.active = False
        if self.cap:
            self.cap.release()
            self.cap = None
