"""Simple logger class"""

import time
import threading
import os

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
    """Simple logging class with simple logging functions.
    Puts the 'fun' in 'functions', really
    """
    def __init__(self):
        self._start = time.time()
        self._lock = threading.Lock()

    def format(self, val, max_len = 10, sep = " "):
        """Formats the time value.

        Args:
            val (float): Value to format.
            max_len (int, optional): Max amount of characters to
            pad. Defaults to 10.
            sep (string, optionnal): Character to pad
            with. Defaults to " "

        Returns:
            string: Formatted time value.
        """
        val = round(val, 4)
        string = str(val)
        point = string.find(".")
        if point < 0:
            string = string + ".00"
        if len(string[point + 1:]) < 2:
            string = string + "0"
        while len(string) < max_len:
            string = sep + string
        if len(string) > max_len:
            string = "..." + string[len(string) - 7:]
        return str(string)

    def tick(self):
        """Creates a string object containing the formated timer.

        Returns:
            string: a formatted timer.
        """
        t = round(time.time() - self._start, 2)
        return CWHITE + "[" + CBEIGE2 + self.format(t) + CWHITE + "]"

    def warning_level(self, level = 0):
        """Creates a string object containing the level of the log.

        Args:
            level (int, optional): level of the log
            0 -> OK
            1 -> LOG
            2 -> ERROR
            3 -> LOG but blue
            . Defaults to 0.

        Returns:
            string: a formatted log header.
        """
        if level == 0:
            return CWHITE + "[" + CGREEN + "   OK" + CWHITE + "] ::"
        if level == 1:
            return CWHITE + "[" + CYELLOW + "  LOG" + CWHITE + "] ::"
        if level == 2:
            return CWHITE + "[" + CRED + CBLINK + "ERROR" + CEND + CWHITE + "] ::"
        if level == 3:
            return CWHITE + "[" + CBEIGE2 + "DEBUG" + CWHITE + "] ::"
        return ""

    def error_format(self, error):
        """Creates an error string object.

        Args:
            error (string): content of the error.

        Returns:
            string: a formatted error header.
        """
        return CWHITE + "{" + CRED + str(error) + CEND + "}"

    def log(self, message, level = 0, error = None):
        """Logs into the console.

        Args:
            message (String): content of the log
            level (int, optional): level of the log. Defaults to 0.
            error (String, optional): content of the error. Defaults to None.
        """
        with self._lock:
            if error is not None:
                print(self.tick(), self.warning_level(level), message, self.error_format(error))
            else:
                print(self.tick(), self.warning_level(level), message)

    def welcome(self):
        """Displays a welcoming message.
        """
        txt = "[" + CGREEN + CBOLD + "WELCOME" + CEND + "] Transcendance awaits you at : "
        txt += CBOLD + CVIOLET + "https://" + os.environ.get("HOST_ADDRESS", "localhost") + CEND
        print(txt)

    @property
    def start(self):
        """Returns the timer object.

        Returns:
            time: the timer object.
        """
        return self._start

    @start.setter
    def start(self, value):
        self._start = value
