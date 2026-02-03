import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FileType, FileStatus, type File, ExternalBlob } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

export function useUserFiles() {
    const { actor, isFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery<File[]>({
        queryKey: ['userFiles', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor || !identity) return [];
            const principal = identity.getPrincipal();
            const files = await actor.getUserFiles(principal);
            return files;
        },
        enabled: !!actor && !isFetching && !!identity,
        refetchInterval: (query) => {
            // Auto-refetch every 3 seconds if there are processing files
            const data = query.state.data;
            if (data && data.some(file => file.status === FileStatus.processing)) {
                return 3000;
            }
            return false;
        },
    });
}

export function useUploadFile() {
    const { actor, isFetching } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            fileId,
            fileType,
            blob,
        }: {
            fileId: string;
            fileType: FileType;
            blob: ExternalBlob;
        }) => {
            if (isFetching) {
                throw new Error('System is initializing. Please wait a moment and try again.');
            }
            if (!actor) {
                throw new Error('Actor not initialized');
            }
            await actor.uploadFile(fileId, fileType, blob);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userFiles'] });
        },
        onError: (error) => {
            console.error('Upload error:', error);
        },
    });
}

export function useUpdateFileStatus() {
    const { actor, isFetching } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ fileId, status }: { fileId: string; status: FileStatus }) => {
            if (isFetching) {
                throw new Error('System is initializing. Please wait a moment and try again.');
            }
            if (!actor) {
                throw new Error('Actor not initialized');
            }
            await actor.updateFileStatus(fileId, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userFiles'] });
        },
        onError: (error) => {
            console.error('Status update error:', error);
        },
    });
}

export function useGetFile(fileId: string | null) {
    const { actor, isFetching } = useActor();

    return useQuery<File | null>({
        queryKey: ['file', fileId],
        queryFn: async () => {
            if (!actor || !fileId) return null;
            return actor.getFile(fileId);
        },
        enabled: !!actor && !isFetching && !!fileId,
        retry: 2,
        retryDelay: 1000,
    });
}
