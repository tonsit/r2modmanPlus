import GameRunnerProvider from '../GameRunnerProvider';
import LoggerProvider, { LogSeverity } from '../../../ror2/logging/LoggerProvider';
import ManagerSettings from '../../../../r2mm/manager/ManagerSettings';
import R2Error from '../../../../model/errors/R2Error';
import { exec } from "child_process";
import path from "path";
import Profile from '../../../../model/Profile';
import GameDirectoryResolverProvider from '../../../ror2/game/GameDirectoryResolverProvider';
import Game from '../../../../model/game/Game';

export default class GameRunnerProviderImpl extends GameRunnerProvider {

    async startModded(game: Game): Promise<void | R2Error> {
        return new Promise(async (resolve, reject) => {
            LoggerProvider.instance.Log(LogSeverity.INFO, 'Launching modded');
            const settings = await ManagerSettings.getSingleton(game);
            const steamDir: string | R2Error = await GameDirectoryResolverProvider.instance.getSteamDirectory();
            if (steamDir instanceof R2Error) {
                return reject(steamDir);
            }
            LoggerProvider.instance.Log(LogSeverity.INFO, `Steam directory is: ${steamDir}`);
            LoggerProvider.instance.Log(LogSeverity.INFO,
                `Running command: ${steamDir}.exe -applaunch ${game.appId} --doorstop-enable true --doorstop-target "${path.join(Profile.getActiveProfile().getPathOfProfile(), "BepInEx", "core", "BepInEx.Preloader.dll")}" ${settings.getContext().gameSpecific.launchParameters}`);
            exec(`"${steamDir}/Steam.exe" -applaunch ${game.appId} --doorstop-enable true --doorstop-target "${path.join(Profile.getActiveProfile().getPathOfProfile(), "BepInEx", "core", "BepInEx.Preloader.dll")}" ${settings.getContext().gameSpecific.launchParameters}`, (err => {
                if (err !== null) {
                    LoggerProvider.instance.Log(LogSeverity.ACTION_STOPPED, 'Error was thrown whilst starting modded');
                    LoggerProvider.instance.Log(LogSeverity.ERROR, err.message);
                    const r2err = new R2Error('Error starting Steam', err.message, 'Ensure that the Steam directory has been set correctly in the settings');
                    return reject(r2err);
                }
                return resolve();
            }));
        });
    }

    async startVanilla(game: Game): Promise<void | R2Error> {
        return new Promise(async (resolve, reject) => {
            LoggerProvider.instance.Log(LogSeverity.INFO, 'Launching vanilla');
            const settings = await ManagerSettings.getSingleton(game);
            const steamDir: string | R2Error = await GameDirectoryResolverProvider.instance.getSteamDirectory();
            if (steamDir instanceof R2Error) {
                return reject(steamDir);
            }
            LoggerProvider.instance.Log(LogSeverity.INFO, `Steam directory is: ${steamDir}`);
            LoggerProvider.instance.Log(LogSeverity.INFO, `Running command: ${steamDir}.exe -applaunch ${game.appId} --doorstop-enable false`);
            exec(`"${steamDir}/Steam.exe" -applaunch ${game.appId} --doorstop-enable false ${settings.getContext().gameSpecific.launchParameters}`, (err => {
                if (err !== null) {
                    LoggerProvider.instance.Log(LogSeverity.ACTION_STOPPED, 'Error was thrown whilst starting modded');
                    LoggerProvider.instance.Log(LogSeverity.ERROR, err.message);
                    const r2err = new R2Error('Error starting Steam', err.message, 'Ensure that the Steam directory has been set correctly in the settings');
                    return reject(r2err);
                }
                return resolve();
            }));
        });
    }

}
