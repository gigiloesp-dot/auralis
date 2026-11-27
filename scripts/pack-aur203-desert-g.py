"""Mechanical whole-pose packer; see pack-aur203-forest-c.py."""
import runpy,sys
from pathlib import Path
sys.argv=[sys.argv[0],'desert-g']
runpy.run_path(str(Path(__file__).with_name('pack-aur203-forest-c.py')),run_name='__main__')
