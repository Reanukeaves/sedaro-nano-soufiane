  import doctest
  import json
  import bisect
  from random import random

  # MODELING & SIMULATION

  init = {
      'Planet': {'time': 0, 'timeStep': 0.01, 'x': 0, 'y': 0.1, 'vx': 0.1, 'vy': 0},
      'Satellite': {'time': 0, 'timeStep': 0.01, 'x': 0, 'y': 1, 'vx': 1, 'vy': 0},
  }

  class QRangeStore:
      def __init__(self):
          self.store = []

      def __setitem__(self, rng, value):
          low, high = rng
          if low >= high:
              raise IndexError("Invalid Range.")
          self.store.append((low, high, value))

      def __getitem__(self, key):
          return [v for (l, h, v) in self.store if l <= key < h]

  def propagate(agent_id, universe):
      state = universe[agent_id]
      time_step = 0.01 + random() * 0.09  # or use state['timeStep'] if it should vary
      return calculate_new_state(agent_id, state, time_step)

  def calculate_new_state(agent_id, state, time_step):
      x, y, vx, vy = state['x'], state['y'], state['vx'], state['vy']

      if agent_id == 'Planet':
          x += vx * time_step
          y += vy * time_step
      else:
          planet_state = state  # assuming planet state is passed directly for satellite
          dx, dy = x - planet_state['x'], y - planet_state['y']
          r3 = (dx**2 + dy**2)**(3/2)
          vx -= dx / r3 * time_step
          vy -= dy / r3 * time_step
          x += vx * time_step
          y += vy * time_step

      return {'time': state['time'] + time_step, 'x': x, 'y': y, 'vx': vx, 'vy': vy}

  def simulate(store, steps=500):
      times = {agent_id: state['time'] for agent_id, state in init.items()}
      for _ in range(steps):
          for agent_id in init:
              t = times[agent_id]
              universe = read(store, t-0.001)
              if set(universe) == set(init):
                  new_state = propagate(agent_id, universe)
                  store[t, new_state['time']] = {agent_id: new_state}
                  times[agent_id] = new_state['time']

  def read(store, t):
      try:
          data = store[t]
          return {k: v for d in data for k, v in d.items()}
      except IndexError:
          return {}

  def print_store(store):
      print("\nStore contents:")
      for item in store.store:
          print(item)

  # Main execution
  if __name__ == "__main__":
      doctest.testmod()
      store = QRangeStore()
      store[-999999999, 0] = init
      simulate(store, 20)
      print_store(store)
