import micropython
import sys
import time
from machine import freq
freq(48000000)

def start_save(file_path, byte_count_to_read):
    f = open(file_path, 'wb')
    print("READY_TO_SAVE", end='')

    if(byte_count_to_read > 0):
        buffer = bytearray(255)

        micropython.kbd_intr(-1)

        rbc = 0
        while(1):
            print(rbc)

            # Always read 255 bytes at a time since that is always sent
            rbc = rbc + sys.stdin.buffer.readinto(buffer, 255)

            if rbc < byte_count_to_read:
                f.write(buffer)
            else:
                f.write(buffer[:255-(rbc-byte_count_to_read)])
                break
        
        micropython.kbd_intr(0x03)
    
    f.close()

    print("FILE_SAVED", end='')