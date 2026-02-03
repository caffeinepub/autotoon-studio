import Storage "blob-storage/Storage";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type FileType = {
    #audio;
    #video;
  };

  type FileStatus = {
    #processing;
    #completed;
    #failed;
  };

  type File = {
    fileId : Text;
    userId : Principal;
    fileType : FileType;
    status : FileStatus;
    blob : Storage.ExternalBlob;
    uploadTime : Time.Time;
    completionTime : ?Time.Time;
  };

  let files = Map.empty<Text, File>();
  let userFiles = Map.empty<Principal, List.List<Text>>();

  public shared ({ caller }) func uploadFile(fileId : Text, fileType : FileType, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    if (files.containsKey(fileId)) {
      Runtime.trap("File ID already exists. Please choose a unique file ID.");
    };

    let file : File = {
      fileId;
      userId = caller;
      fileType;
      status = #processing;
      blob;
      uploadTime = Time.now();
      completionTime = null;
    };

    files.add(fileId, file);

    switch (userFiles.get(caller)) {
      case (null) {
        let fileList = List.singleton(fileId);
        userFiles.add(caller, fileList);
      };
      case (?existingFiles) {
        let newFiles = existingFiles.clone();
        newFiles.add(fileId);
        userFiles.add(caller, newFiles);
      };
    };
  };

  public shared ({ caller }) func updateFileStatus(fileId : Text, status : FileStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update file status");
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File not found") };
      case (?existingFile) {
        if (existingFile.userId != caller) {
          Runtime.trap("Unauthorized: Only the owner can update the file status.");
        };

        let updatedFile = {
          existingFile with
          status;
          completionTime = if (status == #completed) { ?Time.now() } else {
            existingFile.completionTime;
          };
        };
        files.add(fileId, updatedFile);
      };
    };
  };

  public query ({ caller }) func getUserFiles(userId : Principal) : async [File] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view files");
    };

    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own files.");
    };

    let fileList = switch (userFiles.get(userId)) {
      case (null) { List.empty<Text>() };
      case (?list) { list };
    };

    fileList.values().filterMap(func(fileId) { files.get(fileId) }).toArray();
  };

  public query ({ caller }) func getFile(fileId : Text) : async File {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };

    switch (files.get(fileId)) {
      case (null) { Runtime.trap("File not found") };
      case (?file) {
        if (file.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner can access this file.");
        };
        file;
      };
    };
  };
};
