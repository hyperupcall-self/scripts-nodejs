#!/usr/bin/env node
import * as util from 'node:util'
import { spawn } from 'child_process'

const { values, positionals } = util.parseArgs({
	args: process.argv.slice(2),
	allowPositionals: true,
	options: {
		fix: {
			type: 'boolean',
		},
		level: {
			type: 'string',
		},
		help: {
			type: 'boolean',
		},
	},
})

// TODO: --verbose
const helpText = `hyperupcall-scripts-nodejs <SUBCOMMAND> [--help]
SUBCOMMANDS:
  format [--fix]

  lint [--fix] [--level none|dev|commit|release]
`

if (!positionals[0] || !positionals[1]) {
	process.stdout.write(helpText)
	process.exit(1)
}

if (positionals[0] === 'format') {
	if (values.fix) {
		run(['prettier', '--write', '--ignore-unknown', '.'])
	} else {
		run(['prettier', '--check', '--ignore-unknown', '.'])
	}
} else if (positionals[0] === 'lint') {
	if (values.fix) {
		run(['eslint', '--fix', '.'])
	} else {
		run(['eslint', '.'])
	}
} else {
	throw new Error(`Invalid command: ${positionals[0]}`)
}

async function run(/** @type {string[]} */ command) {
	const child = spawn(command[0], command.slice(1), {
		env: {
			...process.env,
			HYPERUPCALL_LINT_LEVEL: values.level || 'dev',
		},
	})
	child.stdout.pipe(process.stdout)
	child.stderr.pipe(process.stderr)
}
