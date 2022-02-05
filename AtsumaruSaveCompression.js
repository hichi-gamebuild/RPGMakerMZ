//=============================================================================
// RPG Maker MZ - AtsumaruSaveCompression
//=============================================================================

// ----------------------------------------------------------------------------
// Copyright (c) 2022 ひち
// This software is released under the MIT License.
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2021/ 2/ 5 オプション・システムファイルにも適用できるよう機能追加
// 1.0.0 2021/ 1/30 初版
// 0.9.0 2022/ 1/29 β版 セーブデータを汚染しないように設計（元に戻せます）
// 0.1.0 2022/ 1/28 α版
// ----------------------------------------------------------------------------
// 作者もまだまだ手探り状態で作っているため、
// バグ報告などいただいても修正できるかどうかについては保証いたしかねます。
// それを承知の上、自己責任でご使用下さい。
// ----------------------------------------------------------------------------

/*:
 * @target MZ
 * @plugindesc Shrink save file on Game Atsumaru Site.
 * @author hichi
 * 
 * @help AtsumaruSaveCompression.js
 *
 * Shrink save file on Game Atsumaru Site.
 * https://game.nicovideo.jp/atsumaru/
 * 
 * To use it, just install the plugin.
 * 
 * I'm noooooooob at English power.
 * sorry. sorry. I'm about to cry. :_(
 * 
 * @command changeAtsumaruSaveCompression
 * @text "SaveCompression" Mode change.
 * @desc "SaveCompression" Mode change.
 * Used when checking the difference.
 *
 * @arg atsumarusave
 * @text Whether to use "SaveCompression"
 * @desc OFF(false) >> Normal save mode.
 * Loading supports all modes as long as the plugin is enabled.
 * @default true
 * @type boolean
 * 
 * @command changeOptionSaveCompression
 * @text Target options for compression.
 * @desc Target options for compression.
 * Used when checking the difference.
 *
 * @arg optionsave
 * @text Target options for compression.
 * @desc OFF(false) >> Normal save mode.
 * Loading supports all modes as long as the plugin is enabled.
 * @default true
 * @type boolean
 * 
 * @param useAtsumaruSaveCompression
 * @text SaveCompression
 * @desc Shrink save file.
 * Valid only at Game Atsumaru Site.
 * @type boolean
 * @default true
 * 
 * @command useOptionSaveCompression
 * @text OptionCompression
 * @desc Shrink option file.
 * Valid only at Game Atsumaru Site.
 * @type boolean
 * @default true
 */

/*:ja
 * @target MZ
 * @plugindesc アツマール上のセーブ容量を削減するプラグイン。
 * @author ひち
 * 
 * @help AtsumaruSaveCompression.js
 *
 * アツマール上のセーブデータを削減して、使用ブロック数を削減するよ。
 * 
 * 今の所、確認しているほぼ全てのケースで使用ブロック数が減少しているので、
 * みんな苦労している（よね？）、セーブブロック数問題解決に役立てるかも？
 * 
 * 使用方法については、基本的にプラグインを導入するだけでオッケー！
 * ただし、このプラグインはアツマール上でしか動作しないから、
 * アツマールにアップする予定がないならゴミ箱へポイしよう！
 * 
 * ちなみに内部的な話をすると、本当は圧縮してる訳じゃないよ。
 * それでも使用ブロック数はちゃんと減るから、気にせず使ってみてね。
 * （気になる人はソース内の備忘録を見てね）
 * --------------------------------------------------------------------
 * 【 セーブの圧縮 】
 * 
 * セーブデータを圧縮する機能。
 * 設定で true にしておけば勝手に動作するよ。（初期値なのでそのままでOK）
 * 
 * false にした場合、保存時は通常のセーブ処理に戻るよ。
 * ロードは 通常データ・圧縮データ どちらでも読めるから安心してね。
 * ただ、プラグインごと OFF にしちゃうと、圧縮データは読めなくなるから注意！
 * 
 * true / false はプラグインコマンドでゲーム中でも変更できるので、
 * 実際効果があるか見てみたい人は、イベントに組み込んでみてもいいかも。
 * --------------------------------------------------------------------
 * 
 * @command changeAtsumaruSaveCompression
 * @text 「セーブの圧縮」の変更
 * @desc 「セーブの圧縮」機能を使用するかどうか変更できます。
 * どれだけの差が出るかを見る時などにお使い下さい。
 *
 * @arg atsumarusave
 * @text 圧縮機能の使用
 * @desc OFF(false) にするとセーブが通常処理に戻ります。
 * ロードはプラグインが有効な限り、どちらでも読めます。
 * @default true
 * @type boolean
 * 
 * @command changeOptionSaveCompression
 * @text 「オプション・システムファイルの圧縮」の変更
 * @desc 「オプション・システムファイルの圧縮」機能を
 * 使用するかどうか変更できます。
 *
 * @arg optionsave
 * @text 圧縮機能の使用
 * @desc OFF(false) にするとセーブが通常処理に戻ります。
 * ロードはプラグインが有効な限り、どちらでも読めます。
 * @default true
 * @type boolean
 * 
 * @param useAtsumaruSaveCompression
 * @text セーブの圧縮
 * @desc セーブデータを圧縮します。
 * アツマール上でのみ有効です。
 * @type boolean
 * @default true
 * 
 * @param useOptionSaveCompression
 * @text ｵﾌﾟｼｮﾝ・ｼｽﾃﾑの圧縮
 * @desc オプション・システムファイルも圧縮対象とするか。
 * 「セーブの圧縮」が false の時は無視します。
 * @type boolean
 * @default true
 */

//-------------------------------------------------------------------
//
// ここから開発者向けのメモというか備忘録
//
//-------------------------------------------------------------------
// 最初はスイッチ・セルフスイッチ変数を最適化して
// セーブデータの容量削減するプラグインを作っていたのですよ。
// でもローカル上では容量が減るのにアツマール上ではブロック数が増えたりとか、
// 謎の挙動が多くて「なんでなんだー」と頭を悩ませていたのです。
// で、有志の方に相談に乗ってもらったり色々教えてもらったりしているうちに、
// 「アツマール自体が別個で圧縮をかけている」という部分に着目するようになりまして。
//
// これってようするにzip圧縮されたデータをアツマールが多重圧縮かけているから、
// ローカル上でどれだけ最適化しても膨れ上がってしまうのでは？という仮説を立てて
// あえてセーブ前にzip圧縮をかけず生データを渡す設定に変えてみるとですね。
// どえらいブロック数削減が起きました。（実験で１０ブロックから５ブロックに）
//
// これが「本当は圧縮してる訳じゃないよ」のカラクリです。
//-------------------------------------------------------------------

(() => {
    'use strict';
    const pluginName = "AtsumaruSaveCompression";
    let enumtop;

    // 圧縮方式のバージョンラベル（何かしらの変更があった時のために）
    enumtop = 0;
    const atsumaruSaveCompressionDataVersion = {
        VERSION_EMPTY: enumtop++,
        //-------------------------------
        VERSION_1_0_0: enumtop++,

        //-------------------------------
        VERSION_LATEST: enumtop-1,
	};

    //-----------------------------------------------------------------------------
    // プラグインのオプション

    // アツマール上でのみ有効なセーブの圧縮を行うかどうか（falseの場合、通常方式のセーブを行う）
    let useAtsumaruSaveCompression = PluginManager.parameters(pluginName).useAtsumaruSaveCompression === "true";

    // オプション・システムファイルも圧縮対象とするかどうか（falseの場合、通常方式でセーブを行う）
    let useOptionSaveCompression = (PluginManager.parameters(pluginName).useOptionSaveCompression === "true");
    //-----------------------------------------------------------------------------
    // プラグインコマンド

    PluginManager.registerCommand(pluginName, 'changeAtsumaruSaveCompression' , args => {
        // 「セーブの圧縮」の変更
        const atsumarusave = args.atsumarusave;
        useAtsumaruSaveCompression = JSON.parse(atsumarusave.toLowerCase());
    });

    PluginManager.registerCommand(pluginName, 'changeOptionSaveCompression' , args => {
        // 「オプション・システムファイルの圧縮」の変更
        const optionsave = args.optionsave;
        useOptionSaveCompression = JSON.parse(optionsave.toLowerCase());
    });
    //-----------------------------------------------------------------------------

    function isAtsumaruMode() {
        // 現在の動作環境がアツマール上かどうかを判定
        return window.RPGAtsumaru ? true : false;
    };

    //-----------------------------------------------------------------------------
    // ConfigManager オーバーライド
    //
    // アツマール上でのみ動く専用のコンフィグファイル読み書き処理を追加
    //-----------------------------------------------------------------------------
    const _ConfigManager_load = ConfigManager.load;
    ConfigManager.load = function() {
        // ゲーム起動時のコンフィグデータ読み込み

        // まずはアツマール用の無圧縮形式で読めるか試す
        const saveName = "config";
        StorageManager.loadObjectAtsumaru(saveName)
            .then(config => {
                // ロード成功
                this.applyData(config || {});
                this._isLoaded = true;
            })
            .catch(() => {
                // 読めなかった場合は通常のロード処理に戻す
                _ConfigManager_load.call(this);
            });
    };

    const _ConfigManager_save = ConfigManager.save;
    ConfigManager.save = function() {
        // コンフィグデータのセーブ

        // アツマールでの動作時、JSONの生データを渡す
        if(isAtsumaruMode() && useOptionSaveCompression && useAtsumaruSaveCompression){
            const saveName = "config";
            StorageManager.saveObjectAtsumaru(saveName, this.makeData());
        }
        else{
            // 通常処理
            _ConfigManager_save.call(this);
        }
    };

    //-----------------------------------------------------------------------------
    // DataManager オーバーライド
    //
    // アツマール上でのみ動く専用のセーブファイル読み書き処理を追加
    //-----------------------------------------------------------------------------
    const _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
    DataManager.makeSavefileInfo = function() {
        // globalInfo に、アツマール用のセーブ方式を適用している事を示すラベルを埋め込む処理を追加
        const info = _DataManager_makeSavefileInfo.call(this);
        if(isAtsumaruMode()){
            // 常に最新版のラベルを埋め込む
            info.atsumaruSave = atsumaruSaveCompressionDataVersion.VERSION_LATEST;

            // オプションで不使用に設定した時はラベルごと削除する
            if(useAtsumaruSaveCompression === false) delete info.atsumaruSave;
        }
        return info;
    };

    const _DataManager_loadGlobalInfo = DataManager.loadGlobalInfo;
    DataManager.loadGlobalInfo = function() {
        // ゲーム起動時の GlobalInfo 読み込み

        // まずはアツマール用の無圧縮形式で読めるか試す
        const saveName = "global";
        StorageManager.loadObjectAtsumaru(saveName)
            .then(globalInfo => {
                // ロード成功
                this._globalInfo = globalInfo;
                this.removeInvalidGlobalInfo();
                return 0;
            })
            .catch(() => {
                // 読めなかった場合は通常のロード処理に戻す
                _DataManager_loadGlobalInfo.call(this);
            });
    };

    const _DataManager_saveGlobalInfo = DataManager.saveGlobalInfo;
    DataManager.saveGlobalInfo = function() {
        // GlobalInfo のセーブ（いわゆるシステムファイル）
        const contents = this._globalInfo;
        const saveName = "global";

        // アツマールでの動作時、JSONの生データを渡す
        if(isAtsumaruMode() && useOptionSaveCompression && useAtsumaruSaveCompression){
            StorageManager.saveObjectAtsumaru(saveName, contents);
        }
        else{
            // 通常処理
            _DataManager_saveGlobalInfo.call(this, saveName, contents);
        }
    };

    const _DataManager_saveGame = DataManager.saveGame;
    DataManager.saveGame = function(savefileId) {
        // セーブスロットのセーブ

        // アツマールでの動作時、JSONの生データを渡す
        if(isAtsumaruMode() && useAtsumaruSaveCompression){
            const contents = this.makeSaveContents();
            const saveName = this.makeSavename(savefileId);
            return StorageManager.saveObjectAtsumaru(saveName, contents).then(() => {
                this._globalInfo[savefileId] = this.makeSavefileInfo();
                this.saveGlobalInfo();
                return 0;
            });
        }
        
        // ここまで来たら通常処理
        return _DataManager_saveGame.call(this, savefileId);
    };

    const _DataManager_loadGame = DataManager.loadGame;
    DataManager.loadGame = function(savefileId) {
        // アツマールでの動作時、JSONの生データを受け取る
        const atsumaru_savever = this.getAtsumaruSaveVersion(savefileId);
        if(isAtsumaruMode() && (atsumaru_savever !== void 0)){
            // アツマール用のセーブデータである事を確認
            // 保存方式のバージョンによってロード方法を変える（プラグインのバージョンではない）
            if(atsumaru_savever === atsumaruSaveCompressionDataVersion.VERSION_1_0_0){
                // ===================================================================
                // Ver 1.0.0
                const saveName = this.makeSavename(savefileId);
                return StorageManager.loadObjectAtsumaru(saveName).then(contents => {
                    this.createGameObjects();
                    this.extractSaveContents(contents);
                    this.correctDataErrors();
                    return 0;
                });
                // ===================================================================
            }
        }

        // ここまで来たら通常処理
        return _DataManager_loadGame.call(this, savefileId);
    };

    //-----------------------------------------------------------------------------
    // DataManager 追加定義
    //
    // アツマールでの動作時、セーブデータがアツマール用に保存されたものであるかをチェックする処理を追加
    //-----------------------------------------------------------------------------
    DataManager.getAtsumaruSaveVersion = function(savefileId) {
        // セーブファイルがアツマール用になっているかは globalInfo が覚えている
        return this._globalInfo[savefileId].atsumaruSave;
    };

    //-----------------------------------------------------------------------------
    // StorageManager 追加定義
    //
    // アツマールでの動作時、zip圧縮を行わない保存処理を追加
    //-----------------------------------------------------------------------------
    StorageManager.saveObjectAtsumaru = function(saveName, object) {
        return this.objectToJson(object).then(zip => this.saveZip(saveName, zip));
    };
    StorageManager.loadObjectAtsumaru = function(saveName) {
        return this.loadZip(saveName).then(json => this.jsonToObject(json));
    };

})();