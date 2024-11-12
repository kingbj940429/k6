#!/bin/bash

set -e

#-- This script is used to run a short load test on the service.
#-- Usage: bash short-load-entrypoint.sh --filename "blue-short-load" --password ""

# Declare constants and variables
declare -r K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write"  # Prometheus remote write server URL
declare -r K6_PROMETHEUS_RW_TREND_STATS="p(95),p(90),min,max,avg"           # Trend statistics for K6
declare FILENAME_REGEX=""        # Filename regex to filter the test files
declare TESTER_PASSWORD=""       # Password to be passed as an environment variable
declare -a successful_tests=()   # Array to store the list of successful tests
declare -a failed_tests=()       # Array to store the list of failed tests

# Parse input arguments
# This section handles input arguments such as --filename and --password
while [[ $# -gt 0 ]]; do
  case $1 in
    --filename)
      FILENAME_REGEX="$2"
      shift 2
      ;;
    --password)
      TESTER_PASSWORD="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Ensure that the --filename option is provided
if [[ -z "$FILENAME_REGEX" ]]; then
  echo "Error: --filename option is required."
  exit 1
fi

# Find matching files
# This section retrieves all JavaScript files matching the provided filename regex
files=($(find ./k6 -type f -name "*.js" | grep -E "$FILENAME_REGEX"))

# Run tests for each file
# Iterate over each matching file, run the K6 test, and record success or failure
for file in "${files[@]}"; do
  echo "=============================================================================="
  echo "Starting test for: $file"
  echo "=============================================================================="

  k6 run \
    -o experimental-prometheus-rw \
    -e TESTER_PASSWORD="$TESTER_PASSWORD" \
    "$file" \
    && {
      echo "=============================================================================="
      echo "✅ Test passed for: $file"
      echo "=============================================================================="
      successful_tests+=("$file")  # Record successful tests
    } || {
      echo "=============================================================================="
      echo "❌ Test failed for: $file"
      echo "=============================================================================="
      failed_tests+=("$file")  # Record failed tests
      continue
    }
done

# Display test results summary
# Summarize and display the list of successful and failed tests
echo "=============================================================================="
echo "Test Results Summary"
echo "=============================================================================="
echo "✅ Successful Tests: ${#successful_tests[@]}"
for test in "${successful_tests[@]}"; do
  echo "  - $test"
done

if [[ ${#failed_tests[@]} -gt 0 ]]; then
  echo "❌ Failed Tests: ${#failed_tests[@]}"
  for test in "${failed_tests[@]}"; do
    echo "  - $test"
  done
else
  echo "🎉 All tests passed successfully!"
fi
echo "=============================================================================="
