'use strict';
const {
  prepareMainThreadExecution,
  markBootstrapComplete
} = require('internal/process/pre_execution');
const { isUsingInspector } = require('internal/util/inspector');
const { run } = require('internal/test_runner/runner');
const { exitCodes: { kGenericUserError } } = internalBinding('errors');

prepareMainThreadExecution(false);
markBootstrapComplete();

let concurrency = true;
let inspectPort;

if (isUsingInspector()) {
  process.emitWarning('Using the inspector with --test forces running at a concurrency of 1. ' +
  'Use the inspectPort option to run with concurrency');
  concurrency = 1;
  inspectPort = process.debugPort;
}

const tapStream = run({ concurrency, inspectPort });
tapStream.pipe(process.stdout);
tapStream.once('test:fail', () => {
  process.exitCode = kGenericUserError;
});
