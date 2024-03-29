import doctest
import json
import bisect
from functools import reduce
from operator import __or__
from random import random

# MODELING & SIMULATION

init = {
    'Planet': {'time': 0, 'timeStep': 0.01, 'x': 0, 'y': 0.1, 'vx': 0.1, 'vy': 0},
    'Satellite': {'time': 0, 'timeStep': 0.01, 'x': 0, 'y': 1, 'vx': 1, 'vy': 0},
}

def propagate(agentId, universe):
    """Propagate agentId from `time` to `time + timeStep`."""
    state = universe[agentId]
    time, timeStep, x, y, vx, vy = state['time'], state['timeStep'], state['x'], state['y'], state['vx'], state['vy']

    if agentId == 'Planet':
        x += vx * timeStep
        y += vy * timeStep
    elif agentId == 'Satellite':
        px, py = universe['Planet']['x'], universe['Planet']['y']
        dx = px - x
        dy = py - y
        fx = dx / (dx**2 + dy**2)**(3/2)
        fy = dy / (dx**2 + dy**2)**(3/2)
        vx += fx * timeStep
        vy += fy * timeStep
        x += vx * timeStep
        y += vy * timeStep

    return {'time': time + timeStep, 'timeStep': 0.01+random()*0.09, 'x': x, 'y': y, 'vx': vx, 'vy': vy}

# DATA STRUCTURE

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

def read(t):
      try:
          data = store[t]
        
          merged_data = {}
          for d in data:
              merged_data.update(d)
          return merged_data
      except IndexError:
          return {}



store = QRangeStore()
store[-999999999, 0] = init
times = {agentId: state['time'] for agentId, state in init.items()}

for _ in range(500):
    for agentId in init:
        t = times[agentId]
        universe = read(t-0.001)
        if set(universe) == set(init):
            newState = propagate(agentId, universe)
            store[t, newState['time']] = {agentId: newState}
            times[agentId] = newState['time']

with open('./public/data.json', 'w') as f:
    f.write(json.dumps(store.store, indent=4))