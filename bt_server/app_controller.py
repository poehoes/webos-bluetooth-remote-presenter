import os
import sys
import string
from collections import namedtuple

Keycode = namedtuple('Keycode', ['keycode', 'modifier'])

def add_ascii_keys(keys):
    # handle ordinary ascii/numbers
    for k,v in zip(string.lowercase + string.digits, string.lowercase + string.digits):
        keys[k] = Keycode(v, "")
    return keys


def get_app_controller(app=None):
    if sys.platform == "darwin":
        return MacAppController(app=app)
    if sys.platform == "win32":
        import win32com.client
        return WinAppController(app=app)
    else:
        raise Exception("Unsupported platform %s" % (sys.platform))


class MacAppController(object):
    def __init__(self, app=None):
        self.app = app
        self.keymap = { 'pgdn': Keycode(121, ""),
                        'pgup': Keycode(116, ""),
                        'alttab': Keycode(48, " using command down "), 
                        'bkspc': Keycode(51, ""), 
                        'space': Keycode(49, ""),
                        '@': Keycode(100, ""),
                        'enter': Keycode(36, "")}
        self.keymap = add_ascii_keys(self.keymap)
        
    def send_key(self, key):        
        if self.keymap.has_key(key):
            # print "Sending '%s' to application" % (self.keymap[key],)
            key_press = ""
            try:
                int(self.keymap[key].keycode)
                key_press = ' key code %s' % (self.keymap[key].keycode,)
            except:
                key_press = ' keystroke "%s"' % (self.keymap[key].keycode,) 
                
            cmd = """
                  osascript -e 'tell application "System Events" to %s %s' 
                """ % (key_press, self.keymap[key].modifier)
            os.system(cmd)
            # print "sending: ", cmd
        else:
            print "No key mapping found for '%s'" % (key,)


class WinAppController(object):
    def __init__(self, app=None):
        self.app = app
        self.shell = win32com.client.Dispatch("WScript.Shell")
        self.keymap = { 'pgdn': Keycode('{PGDN}', ""), 
                        'pgup': Keycode('{PGUP}', ""), 
                        'alttab': Keycode('%{TAB}', ""),  
                        'bkspc': Keycode('{BS}', ""), 
                        'space': Keycode(' ', ""),
                        '@': Keycode('@', ""),
                        'enter': Keycode('{ENTER}', "")}
        self.keymap = add_ascii_keys(self.keymap)
        
    def send_key(self, key):
        if self.app:
            # To set the focus on "app"
            self.shell.AppActivate(self.app)
        if self.keymap.has_key(key):
            print "Sending '%s' to application" % (self.keymap[key],)
            self.shell.SendKeys(self.keymap[key])
        else:
            print "No key mapping found for '%s'" % (key,)



