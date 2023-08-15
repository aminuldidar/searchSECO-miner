/**
 * This program has been developed by students from the bachelor Computer Science at Utrecht University within the Software Project course.
 * � Copyright Utrecht University (Department of Information and Computing Sciences)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InputParser } from './Input';
import Logger, { Verbosity } from './modules/searchSECO-logger/src/Logger';
import CommandFactory from './CommandFactory';
import Command from './Command';

/**
 * Try to run a command. If an error orccured, print it to stdout and retry.
 * @param command The command to run
 */
async function Run(command: Command | undefined) {
	try {
		await command?.Execute(Logger.GetVerbosity());
	} catch (e) {
		Logger.Error(`Miner exited with error ${e}. Restarting after 2 seconds...`, Logger.GetCallerLocation());
		setTimeout(async () => {
			await Run(command);
		}, 2000);
	}
}

async function RunWithoutErrorHandling(command: Command | undefined) {
	await command?.Execute(Logger.GetVerbosity())
}

export default class Miner {
	private _id: string;

	constructor(id: string) {
		this._id = id;
	}

	/**
	 * Starts the miner with the command supplied by the user.
	 */
	public async Start() {
		// Sanitize input and setup logger
		const input = InputParser.Parse();
		Logger.SetModule('miner');
		Logger.SetVerbosity(input.Flags.Verbose || Verbosity.SILENT);
		Logger.Debug('Sanitized and parsed user input', Logger.GetCallerLocation());

		const commandFactory = new CommandFactory();
		if (input.Flags.Help) commandFactory.PrintHelpMessage(input.Command);
		else if (input.Flags.Version) console.log('v1.0.0');
		else {
			// Try to run the command. If an error occurs, restart after 2 seconds.
			//await Run(commandFactory.GetCommand(input.Command, this._id, input.Flags));
			await RunWithoutErrorHandling(commandFactory.GetCommand(input.Command, this._id, input.Flags));
		}
	}
}
