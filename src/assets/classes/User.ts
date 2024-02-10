import moment from "moment";
import db from "../utilities/db";

export default class User {
    public id: string;
    public username: string;
    public email: string;
    public permissionLevel: number;
    constructor(UserData: QuoiBouffeEt.UserData) {
        this.id = UserData.id;
        this.username = UserData.username;
        this.email = UserData.email;
        this.permissionLevel = UserData.permissionLevel;
    }

    async Update(UserData: QuoiBouffeEt.UserData){
        this.id = UserData.id;
        this.username = UserData.username;
        this.email = UserData.email;
        this.permissionLevel = UserData.permissionLevel;
        return this;
    }

    async AddToMap(UsersMap: Map<string, User>) {
        UsersMap.set(this.id, this);
        return this;
    }

    async saveToken(tokenId: string) {
        await db.query(`INSERT INTO tokens (id, userId, created, expiresAt) VALUES (?,?,?,?)`, [tokenId, this.id, moment().format("YYYY-MM-DD HH:mm:ss"), moment().add("30", "days").format("YYYY-MM-DD HH:mm:ss")]);
        return true;
    }

    async revokeToken(tokenId: string) {
        await db.query(`UPDATE tokens SET valid = 0 WHERE userId = ? AND id = ?;`, [this.id, tokenId]);
        return true;
    }

    async revokeTokensBut(tokenId: string) {
        await db.query(`UPDATE tokens SET valid = 0 WHERE userId = ? AND NOT id = ?;`, [this.id, tokenId]);
    }

    async IsTokenValid(token: string) {
        return true;
    }
}