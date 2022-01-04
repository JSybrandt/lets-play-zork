import unittest
import zork_controller
import textwrap
from multiprocessing.pool import ThreadPool


class ZorkControllerTest(unittest.TestCase):
  def assertHistory(self):
    for h in zork_controller._HISTORY:
      self.assertTrue(len(h) == 1)
      k = list(h.keys())[0]
      self.assertTrue(k in ["command", "prompt"])

  def test_zork_starts(self):
    self.assertTrue(zork_controller.is_zork_running())
    self.assertHistory()

  def test_restart(self):
    self.assertTrue(zork_controller.is_zork_running())
    self.assertHistory()
    zork_controller.restart()
    self.assertTrue(zork_controller.is_zork_running())
    self.assertHistory()

  def test_session(self):
    zork_controller.restart()
    self.assertHistory()
    zork_controller.send_command("n")
    self.assertHistory()
    expected = [
      dict(prompt=textwrap.dedent("""
        Welcome to Dungeon.\t\t\tThis version created 11-MAR-91.
        You are in an open field west of a big white house with a boarded
        front door.
        There is a small mailbox here.
      """).strip()),
      dict(command="n"),
      dict(prompt=textwrap.dedent("""
        You are facing the north side of a white house.  There is no door here,
        and all the windows are barred.
      """).strip())]
    self.assertHistory()

  def test_q_not_allowed(self):
    with self.assertRaises(ValueError):
      zork_controller.send_command("q")
    self.assertHistory()

    with self.assertRaises(ValueError):
      zork_controller.send_command("Q")
    self.assertHistory()

  def test_quit_not_allowed(self):
    with self.assertRaises(ValueError):
      zork_controller.send_command("quit")
    self.assertHistory()

    with self.assertRaises(ValueError):
      zork_controller.send_command("Quit")
    self.assertHistory()


  def test_threadsage(self):
    def send_cmd(i):
      if i % 2:
        zork_controller.send_command("n")
      else:
        zork_controller.get_history()
    with ThreadPool() as p:
      p.map(send_cmd, range(100))
    self.assertHistory()

  def test_max_history_size(self):
    zork_controller.restart()
    for _ in range(10):
      for _ in range(zork_controller._MAX_HISTORY):
        zork_controller.send_command("garbage")
    history = zork_controller.get_history()
    self.assertEqual(len(history), zork_controller._MAX_HISTORY)
    self.assertEqual(history[-1]["prompt"], "I don't understand that.")
    self.assertEqual(history[-2]["command"], "garbage")
    self.assertHistory()

  def test_restart_on_death(self):
    zork_controller.restart()
    # These moves will put you in a dark place and get eaten.
    for cmd in ["north", "east", "open", "enter", "west", "move rug",
                "open trap door", "down", "north", "north"]:
      zork_controller.send_command(cmd)
    self.assertHistory()
    # We should have restarted.
    self.assertTrue(zork_controller.is_zork_running())
    self.assertEqual(zork_controller.get_history()[-1]["prompt"],
      textwrap.dedent("""
        Welcome to Dungeon.\t\t\tThis version created 11-MAR-91.
        You are in an open field west of a big white house with a boarded
        front door.
        There is a small mailbox here.
      """).strip())
    print(zork_controller.get_history())
    self.assertHistory()

  def test_command_too_long(self):
    with self.assertRaises(ValueError):
      zork_controller.send_command("n" * 201)
    self.assertHistory()
