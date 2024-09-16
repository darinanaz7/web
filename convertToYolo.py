def convert_to_yolo_format(x, y, width, height, img_width, img_height):
    centerX = x + (width / 2.0)
    centerY = y + (height / 2.0)
    
    yolo_centerX = centerX / img_width
    yolo_centerY = centerY / img_height
    yolo_width = width / img_width
    yolo_height = height / img_height
    
    return [yolo_centerX, yolo_centerY, yolo_width, yolo_height]
