import json
import random
from functools import reduce
from operator import __or__

# Constants
TIME_STEP = 0.01
VARIANCE = 0.09
INIT_TIME = -999999999

# Initial state
init = {
    'Planet': {'time': 0, 'timeStep': TIME_STEP, 'x': 0, 'y': 0.1, 'vx': 0.1, 'vy': 0},
    'Satellite': {'time': 0, 'timeStep': TIME_STEP, 'x': 0, 'y': 1, 'vx': 1, 'vy': 0},
}

def propagate(agent_id, universe):
    """Propagate agent_id from `time` to `time + timeStep`."""
    state = universe[agent_id]
    time_step = TIME_STEP + random.random() * VARIANCE
    new_state = calculate_new_state(agent_id, state, universe, time_step)
    return new_state

def calculate_new_state(agent_id, state, universe, time_step):
    #separate the physics calculations for each agent
    if agent_id == 'Planet':
        return calculate_planet_new_state(state, time_step)
    elif agent_id == 'Satellite':
        return calculate_satellite_new_state(state, universe, time_step)

def calculate_planet_new_state(state, time_step):
    x, y, vx, vy = state['x'], state['y'], state['vx'], state['vy']
   
    x += vx * time_step
    y += vy * time_step

    return {'time': state['time'] + time_step, 'timeStep': time_step, 'x': x, 'y': y, 'vx': vx, 'vy': vy}


def calculate_satellite_new_state(state, universe, time_step):
    # Extract planet and satellite states
    planet_state = universe['Planet']
    x, y, vx, vy = state['x'], state['y'], state['vx'], state['vy']
    
    dx = planet_state['x'] - x
    dy = planet_state['y'] - y
    distance_squared = dx**2 + dy**2
    distance_cubed = distance_squared ** 1.5  #avoiding math.pow for performance

    #Gravitational force calculation (simplified)
    # Assuming G * mass_of_planet = 1 for simplicity
    force_magnitude = 1 / distance_cubed

    #Update velocity based on gravitational force
    vx += force_magnitude * dx * time_step
    vy += force_magnitude * dy * time_step

  
    x += vx * time_step
    y += vy * time_step

    return {'time': state['time'] + time_step, 'timeStep': time_step, 'x': x, 'y': y, 'vx': vx, 'vy': vy}


class QRangeStore:
    def __init__(self):
        self.store = []

    def __setitem__(self, rng, value):
        low, high = rng
        if low >= high:
            raise IndexError("Invalid Range.")

        # keep the store sorted by inserting the new range in the correct position
        index = self._find_insert_index(low)
        self.store.insert(index, (low, high, value))

    def __getitem__(self, key):
        index = self._binary_search(key)
        if index is not None:
            _, _, value = self.store[index]
            return value
        raise IndexError("Not found.")

    def _find_insert_index(self, low):
        #replaced with binary search for better efficiency
        for index, (l, _, _) in enumerate(self.store):
            if low < l:
                return index
        return len(self.store)

    def _binary_search(self, key):
        # Binary search querying
        lo, hi = 0, len(self.store) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            l, h, _ = self.store[mid]
            if l <= key < h:
                return mid
            elif key < l:
                hi = mid - 1
            else:
                lo = mid + 1
        return None

# Simulation logic
store = QRangeStore()
store[INIT_TIME, 0] = init
times = {agent_id: state['time'] for agent_id, state in init.items()}

for _ in range(500):
    for agent_id in init:
        t = times[agent_id]
        universe = read(t - 0.001)
        if set(universe) == set(init):
            new_state = propagate(agent_id, universe)
            store[t, new_state['time']] = {agent_id: new_state}
            times[agent_id] = new_state['time']

with open('./public/data.json', 'w') as f:
    json.dump(store.store, f, indent=4)
