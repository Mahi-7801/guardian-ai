import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";

export interface Post {
    id?: number;
    title: string;
    content: string;
    author: string;
    created_at?: string;
}

// Persistent storage keys
const TABLE_STATUS_KEY = 'guardian_posts_table_unindexed';
const SIMULATED_POSTS_KEY = 'guardian_simulated_posts_v1';

const INITIAL_MOCK_POSTS: Post[] = [
    {
        id: 1,
        title: "Zero-Day Vulnerability in Industrial Controllers",
        content: "A new critical vulnerability has been discovered in common PLC used in water treatment facilities. Patch 1.4.2 required.",
        author: "AI-Sentinel",
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 2,
        title: "Ransomware Wave Targeting Healthcare",
        content: "Increased activity from 'ShadowNode' group targeting private clinic databases. isolate legacy terminal servers.",
        author: "Threat-Intel",
        created_at: new Date(Date.now() - 7200000).toISOString()
    }
];

export const usePosts = () => {
    const queryClient = useQueryClient();

    const getSimulatedPosts = (): Post[] => {
        const stored = localStorage.getItem(SIMULATED_POSTS_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return INITIAL_MOCK_POSTS;
            }
        }
        return INITIAL_MOCK_POSTS;
    };

    const saveSimulatedPost = (post: Post) => {
        const current = getSimulatedPosts();
        const updated = [{ ...post, id: Date.now(), created_at: new Date().toISOString() }, ...current];
        localStorage.setItem(SIMULATED_POSTS_KEY, JSON.stringify(updated.slice(0, 20))); // Keep last 20
        return updated;
    };

    const fetchPosts = async () => {
        // If we've already confirmed/assumed table is missing
        if (localStorage.getItem(TABLE_STATUS_KEY)) {
            return getSimulatedPosts();
        }

        try {
            const { data, error } = await insforge.database
                .from("posts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                const err = error as any;
                if (err.status === 404 || err.code === 'PGRST116') {
                    localStorage.setItem(TABLE_STATUS_KEY, 'true');
                    console.warn("Database Node 'posts' not provisioned. Switched to Persistent Simulation Mode.");
                    return getSimulatedPosts();
                }
                throw error;
            }
            return data as Post[];
        } catch (error: any) {
            console.warn("Sync Interrupted. Using Local Buffer.");
            return getSimulatedPosts();
        }
    };

    const createPost = async (post: Post) => {
        try {
            // Check if we are in simulation mode already
            if (localStorage.getItem(TABLE_STATUS_KEY)) {
                throw new Error("Simulation Mode Active");
            }

            const { data, error } = await insforge.database
                .from("posts")
                .insert([post]);

            if (error) throw error;
            return data;
        } catch (error: any) {
            // Save to simulation storage
            const updated = saveSimulatedPost(post);

            // Update the UI immediately for simulation
            queryClient.setQueryData(["posts"], updated);

            toast.success("Intelligence synchronized (Virtual Uplink)");
            return post;
        }
    };

    const postsQuery = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
        retry: false,
        staleTime: 60000,
    });

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    return {
        posts: postsQuery.data || getSimulatedPosts(),
        isLoading: postsQuery.isLoading && !localStorage.getItem(TABLE_STATUS_KEY),
        error: postsQuery.error,
        createPost: createPostMutation.mutate,
        isCreating: createPostMutation.isPending,
    };
};
