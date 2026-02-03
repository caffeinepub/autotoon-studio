import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface File {
    status: FileStatus;
    completionTime?: Time;
    blob: ExternalBlob;
    userId: Principal;
    fileType: FileType;
    fileId: string;
    uploadTime: Time;
}
export enum FileStatus {
    completed = "completed",
    processing = "processing",
    failed = "failed"
}
export enum FileType {
    audio = "audio",
    video = "video"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getFile(fileId: string): Promise<File>;
    getUserFiles(userId: Principal): Promise<Array<File>>;
    isCallerAdmin(): Promise<boolean>;
    updateFileStatus(fileId: string, status: FileStatus): Promise<void>;
    uploadFile(fileId: string, fileType: FileType, blob: ExternalBlob): Promise<void>;
}
