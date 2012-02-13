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
    if sys.platform == "linux2":
        return LinuxAppController(app=app)
    if sys.platform == "win32":
        import win32com.client
        return WinAppController(app=app)
    else:
        raise Exception("Unsupported platform %s" % (sys.platform))

class LinuxAppController(object):
    def __init__(self, app=None):
        import virtkey

        self.keyEmulator = virtkey.virtkey()
        self.app = app
        self.keymap = { 'pgdn': 0xFF9B,
                        'pgup': 0xFF9A,
                        'crup': 0xFF97,
                        'crdn': 0xFF99,
                        'crlt': 0xFF96,
                        'crrt': 0xFF98,
                        'alttab': 0xFF09, 
                        'bkspc': 0xFF08, 
                        'space': 0xFF80,
                        '@': 0x040,
                        'enter': 0xFF8D}
        
    def send_key(self, key):        
        if self.keymap.has_key(key):
            if key in ['alttab']:
                self.keyEmulator.latch_mod((1 << 3))
            self.keyEmulator.press_keysym(self.keymap[key])
            self.keyEmulator.release_keysym(self.keymap[key])
            if key in ['alttab']:
                self.keyEmulator.press_keysym(0xFFE9)
                self.keyEmulator.release_keysym(0xFFE9)
        else: 
            try:
                self.keyEmulator.press_unicode(ord(key))
                self.keyEmulator.release_unicode(ord(key))
            except:
                print "No key mapping found for '%s'" % (key,)


class MacAppController(object):
    def __init__(self, app=None):
        self.app = app
        self.keymap = { 'pgdn': Keycode(121, ""),
                        'pgup': Keycode(116, ""),
                        'crup': Keycode(126, ""),
                        'crdn': Keycode(125, ""),
                        'crlt': Keycode(123, ""),
                        'crrt': Keycode(124, ""),
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
            except: # keycode not an integer -> use keystroke
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
        import win32com
        
        self.app = app
        self.shell = win32com.client.Dispatch("WScript.Shell")
        self.keymap = { 'pgdn': Keycode('{PGDN}', ""), 
                        'pgup': Keycode('{PGUP}', ""), 
                        'crup': Keycode('{UP}', ""), 
                        'crdn': Keycode('{DOWN}', ""), 
                        'crlt': Keycode('{LEFT}', ""), 
                        'crrt': Keycode('{RIGHT}', ""), 
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
            # print "Sending '%s' to application" % (self.keymap[key].keycode,)
            self.shell.SendKeys(self.keymap[key].keycode)
        else:
            print "No key mapping found for '%s'" % (key,)



