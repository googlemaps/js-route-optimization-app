#!/bin/bash

# This script must be located in the root directory of the Python code.
cd "$(dirname "$0")"
python3 -m unittest discover -s . -p '*_test.py'
