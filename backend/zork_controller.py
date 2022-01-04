import subprocess
import os
import threading

_LOCK = threading.Lock()
_HISTORY=[]
_MAX_HISTORY = 20

def get_history():
  with _LOCK:
    return _HISTORY

def _add_to_history(command=None, prompt=None):
  global _HISTORY
  hist = {}
  if command is not None:
    hist["command"] = command
  if prompt is not None:
    hist["prompt"] = prompt
  _HISTORY.append(hist)
  if len(_HISTORY) > _MAX_HISTORY:
    _HISTORY = _HISTORY[-_MAX_HISTORY:]
  print(_HISTORY[-1])

def is_zork_running():
  global _ZORK_PROC
  return _ZORK_PROC is not None and _ZORK_PROC.poll() is None

def _add_new_prompt():
  global _ZORK_PROC
  buffer = []
  def is_prompt_complete():
    if len(buffer) >= 1 and buffer[-1] == "":
      # Error case. Pipe closed.
      return False
    if len(buffer) >= 2:
      return buffer[-2:] == ["\n", ">"]
    return False
  while is_zork_running() and not is_prompt_complete():
    buffer.append(_ZORK_PROC.stdout.read(1))
  # Remove the > from the prompt.
  if is_prompt_complete():
    buffer = buffer[:-2]
  _add_to_history(prompt= "".join(buffer))

def restart():
  global _ZORK_PROC, _HISTORY
  with _LOCK:
    print("Restarting Zork.")
    try:
      if _ZORK_PROC is not None:
        _ZORK_PROC.kill()
        _ZORK_PROC.wait(timeout=5)
    except subprocess.TimeoutExpired:
      raise ValueError("Failed to kill zork. Beware a zombie process.")
    finally:
      _ZORK_PROC = subprocess.Popen(
        ["snap", "run", "zork"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        universal_newlines=True)
      #_HISTORY = []
      _add_new_prompt()

def send_command(command):
  global _ZORK_PROC
  if len(command) > 200:
    raise ValueError("Command too long.")
  with _LOCK:
    if not is_zork_running():
      raise ValueError("Attempted to send_command while zork wasn't running.")
    command = command.strip()
    if command.lower() in ["q", "quit"]:
      raise ValueError("You're not allowed to quit the game.")
    _ZORK_PROC.stdin.write(command + "\n")
    _ZORK_PROC.stdin.flush()
    _add_to_history(command=command)
    _add_new_prompt()
  if not is_zork_running():
    _add_to_history(prompt="You died! Restarting...")
    restart()

_ZORK_PROC = None
restart()
