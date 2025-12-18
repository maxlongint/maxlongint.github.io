import { Bookmark } from '../App';
import BookmarkCard from './BookmarkCard';

interface BookmarkListProps {
    bookmarks: Bookmark[];
    getTagColor: (tag: string) => string;
}

export default function BookmarkList({ bookmarks, getTagColor }: BookmarkListProps) {
    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="mt-4 text-gray-500">没有找到匹配的书签</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookmarks.map((bookmark, index) => (
                <BookmarkCard key={`${bookmark.url}-${index}`} bookmark={bookmark} getTagColor={getTagColor} />
            ))}
        </div>
    );
}
