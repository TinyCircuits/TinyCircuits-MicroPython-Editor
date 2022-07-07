import os

def build(path):
    try:
        path = path.split('/')
        builtPath = path[0]
        for i in range(1, len(path)+1):
            try:
                os.mkdir(builtPath)
            except OSError:
                pass
            if i < len(path):
                builtPath = builtPath + '/' + path[i]
    except Exception as err:
        pass
