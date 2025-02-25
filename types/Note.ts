type Note = {
    id: number;
    content: string;
    title: string;
    tag: number;
    createdAt: Date;
    canDelete: boolean;
    authorId: number;
}