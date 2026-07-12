import cv2
import time
import argparse
import logging
import sys
import numpy as np

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("StreamDemo")

def generate_synthetic_frame(frame_num, width=640, height=480):
    """
    Generates a synthetic frame representing a retail store floor layout
    with animated simulated customer movements to test frame processing.
    """
    # Create black canvas
    frame = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Draw static grid representing shelving zones
    for x in range(0, width, 80):
        cv2.line(frame, (x, 0), (x, height), (30, 30, 30), 1)
    for y in range(0, height, 60):
        cv2.line(frame, (0, y), (width, y), (30, 30, 30), 1)
        
    # Draw static "shelves"
    cv2.rectangle(frame, (100, 100), (220, 380), (100, 50, 50), -1)
    cv2.putText(frame, "Shelf A", (110, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
    
    cv2.rectangle(frame, (400, 100), (520, 380), (50, 50, 100), -1)
    cv2.putText(frame, "Shelf B", (410, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
    
    # Draw simulated walking customer (moving circle)
    center_x = int(300 + 80 * np.sin(frame_num * 0.05))
    center_y = int(240 + 120 * np.cos(frame_num * 0.03))
    cv2.circle(frame, (center_x, center_y), 15, (0, 255, 0), -1)
    cv2.circle(frame, (center_x, center_y), 8, (0, 180, 0), -1)
    
    # Frame metadata overlay
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S") + f".{int((time.time() % 1) * 1000):03d}"
    cv2.putText(frame, f"Simulated Camera Stream | Frame: {frame_num}", (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(frame, f"Time: {timestamp_str}", (20, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1, cv2.LINE_AA)
                
    return frame

def run_stream(source, target_fps=25, resize_width=640, resize_height=480, max_frames=100):
    logger.info(f"Initializing OpenCV stream processing...")
    logger.info(f"Configuration: Source={source}, Target FPS={target_fps}, Dimensions={resize_width}x{resize_height}, Max Frames={max_frames}")
    
    cap = None
    is_synthetic = False
    
    if source.lower() == "synthetic":
        is_synthetic = True
        logger.info("Using synthetic animated video frame generator.")
    else:
        # Check if source is a local webcam ID
        try:
            if source.isdigit():
                source_val = int(source)
                logger.info(f"Opening local hardware camera index: {source_val}")
            else:
                source_val = source
                logger.info(f"Opening video file or network RTSP stream: '{source_val}'")
                
            cap = cv2.VideoCapture(source_val)
            if not cap.isOpened():
                logger.warning(f"Failed to open video source '{source}'. Falling back to synthetic source.")
                is_synthetic = True
        except Exception as e:
            logger.error(f"Error opening source: {e}. Falling back to synthetic stream.")
            is_synthetic = True
            
    frame_count = 0
    start_time = time.time()
    last_log_time = time.time()
    
    # Check if window GUI environment is available
    gui_available = True
    try:
        cv2.namedWindow("Consumer Attention Mapping - Stream Verification", cv2.WINDOW_NORMAL)
    except Exception:
        gui_available = False
        logger.info("Running in headless/no-GUI mode. Video window display will be skipped. Only frame metadata will be logged.")

    try:
        while True:
            loop_start = time.time()
            
            # Check maximum frame constraint
            if max_frames > 0 and frame_count >= max_frames:
                logger.info(f"Max frames limit reached ({max_frames}). Verification complete!")
                break
                
            if is_synthetic:
                frame = generate_synthetic_frame(frame_count, resize_width, resize_height)
                success = True
            else:
                success, frame = cap.read()
                if not success:
                    logger.warning("Stream ended or failed to read frame. Attempting to loop or exit...")
                    # If it's a file, we can rewind it
                    if isinstance(source_val, str) and not source_val.startswith("rtsp"):
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        success, frame = cap.read()
                        if not success:
                            break
                    else:
                        break
                        
                # Optional resizing
                if frame.shape[1] != resize_width or frame.shape[0] != resize_height:
                    frame = cv2.resize(frame, (resize_width, resize_height))
                    
            frame_count += 1
            
            # Log periodic stats every 5 seconds
            elapsed = time.time() - last_log_time
            if elapsed >= 5.0:
                fps = frame_count / (time.time() - start_time)
                logger.info(f"Status check: Processed {frame_count} frames. Average processing speed: {fps:.2f} FPS.")
                # Basic memory allocation verification (make sure shape is steady)
                logger.debug(f"Frame shape stability verification: {frame.shape} | Bytes: {frame.nbytes}")
                last_log_time = time.time()
                
            # Render to GUI window if available
            if gui_available:
                cv2.imshow("Consumer Attention Mapping - Stream Verification", frame)
                # Press 'q' or 'ESC' to quit
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:
                    logger.info("Quit key pressed. Exiting stream script.")
                    break
            else:
                # In headless environments, simulate processing delay to match target FPS
                processing_time = time.time() - loop_start
                delay = (1.0 / target_fps) - processing_time
                if delay > 0:
                    time.sleep(delay)
                    
    except KeyboardInterrupt:
        logger.info("Process interrupted by keyboard. Exiting stream script.")
    finally:
        if cap:
            cap.release()
        if gui_available:
            try:
                cv2.destroyAllWindows()
            except Exception:
                pass
            
        total_elapsed = time.time() - start_time
        final_fps = frame_count / total_elapsed if total_elapsed > 0 else 0
        logger.info(f"Stream ingestion summary: Total Frames = {frame_count}, Duration = {total_elapsed:.2f}s, Avg Speed = {final_fps:.2f} FPS.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OpenCV Stream Verification & Demo Script")
    parser.add_argument(
        "--source", 
        type=str, 
        default="synthetic", 
        help="Video source: 'synthetic' (default), camera index (e.g. '0'), sample file path, or RTSP stream URL"
    )
    parser.add_argument(
        "--fps", 
        type=int, 
        default=25, 
        help="Target streaming Frame Rate (default: 25)"
    )
    parser.add_argument(
        "--width", 
        type=int, 
        default=640, 
        help="Resize frame width (default: 640)"
    )
    parser.add_argument(
        "--height", 
        type=int, 
        default=480, 
        help="Resize frame height (default: 480)"
    )
    parser.add_argument(
        "--max-frames", 
        type=int, 
        default=100, 
        help="Maximum frames to process before exiting. Set to 0 or less for infinite loop. (default: 100)"
    )
    
    args = parser.parse_args()
    
    run_stream(
        source=args.source,
        target_fps=args.fps,
        resize_width=args.width,
        resize_height=args.height,
        max_frames=args.max_frames
    )
