from distutils.core import setup
import py2exe
import os

origIsSystemDLL = py2exe.build_exe.isSystemDLL
def isSystemDLL(pathname):
        if os.path.basename(pathname).lower() in ("mfc90.dll"):
                return 0
        return origIsSystemDLL(pathname)
py2exe.build_exe.isSystemDLL = isSystemDLL


setup(console=['bluetoothserver.py'],  options={"py2exe":{"dll_excludes":[ "mswsock.dll", "powrprof.dll" ]}})
