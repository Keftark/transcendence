import time

CEND      = '\33[0m'
CBOLD     = '\33[1m'
CITALIC   = '\33[3m'
CURL      = '\33[4m'
CBLINK    = '\33[5m'
CBLINK2   = '\33[6m'
CSELECTED = '\33[7m'

CBLACK  = '\33[30m'
CRED    = '\33[31m'
CGREEN  = '\33[32m'
CYELLOW = '\33[33m'
CBLUE   = '\33[34m'
CVIOLET = '\33[35m'
CBEIGE  = '\33[36m'
CWHITE  = '\33[37m'

CBLACKBG  = '\33[40m'
CREDBG    = '\33[41m'
CGREENBG  = '\33[42m'
CYELLOWBG = '\33[43m'
CBLUEBG   = '\33[44m'
CVIOLETBG = '\33[45m'
CBEIGEBG  = '\33[46m'
CWHITEBG  = '\33[47m'

CGREY    = '\33[90m'
CRED2    = '\33[91m'
CGREEN2  = '\33[92m'
CYELLOW2 = '\33[93m'
CBLUE2   = '\33[94m'
CVIOLET2 = '\33[95m'
CBEIGE2  = '\33[96m'
CWHITE2  = '\33[97m'

CGREYBG    = '\33[100m'
CREDBG2    = '\33[101m'
CGREENBG2  = '\33[102m'
CYELLOWBG2 = '\33[103m'
CBLUEBG2   = '\33[104m'
CVIOLETBG2 = '\33[105m'
CBEIGEBG2  = '\33[106m'
CWHITEBG2  = '\33[107m'

class Logger:
    def __init__(self):
        self._start = time.time()

    def tick(self):
        t = str(round(time.time() - self._start, 2))
        return CWHITE + "[" + CBLUE + t + CWHITE + "]"
    
    def warning_level(self, level = 0):
        if level == 0:
            return CWHITE + "[" + CGREEN + " OK " + CWHITE + "]\t::"
        if level == 1:
            return CWHITE + "[" + CYELLOW + " LOG " + CWHITE + "]\t::"
        if level == 2:
            return CWHITE + "[" + CRED + CBLINK + "ERROR" + CEND + CWHITE + "]\t::"
        
    def error_format(self, error):
        return CWHITE + "{" + CRED + str(error) + CEND + "}"
        
    def log(self, message, level = 0, error = None):
        if error is not None:
            print(self.tick(), self.warning_level(level), message, self.error_format(error))
        else:
            print(self.tick(), self.warning_level(level), message)

    @property
    def start(self):
        return self._start

    @start.setter
    def start(self, value):
        self._start = value