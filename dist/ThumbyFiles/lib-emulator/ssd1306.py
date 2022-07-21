# MicroPython SSD1306 OLED driver, I2C and SPI interfaces- modified for Thumby

import emulator

class SSD1306():
    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8
        self.buffer = bytearray(self.pages * self.width)

    def init_display(self):
        pass

    def poweroff(self):
        pass

    def poweron(self):
        pass

    def contrast(self, contrast):
        pass

    def invert(self, invert):
        pass

    @micropython.native
    def show(self):
        emulator.update_breakpoint()


class SSD1306_I2C(SSD1306):
    def __init__(self, width, height, i2c, res, addr=0x3C, external_vcc=False):
        super().__init__(width, height, external_vcc)
        pass

    def reset(self):
        pass
        
    def write_window_cmd1(self):
        pass
        
    def write_window_cmd2(self):
        pass

    def write_cmd(self, cmd):
        pass

    @micropython.native
    def write_data(self, buf):
        pass


class SSD1306_SPI(SSD1306):
    def __init__(self, width, height, spi, dc, res, cs, external_vcc=False):
        super().__init__(width, height, external_vcc)
        pass

    def reset(self):
        pass

    @micropython.native
    def write_cmd(self, cmd):
        pass
        
    @micropython.native
    def write_window_cmd(self):
        pass

    @micropython.native
    def write_data(self, buf):
        pass


