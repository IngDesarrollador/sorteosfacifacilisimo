import React from 'react';
import type { CommentBlock } from '../utils/commentParser';

interface CommentsTableProps {
  comments: CommentBlock[];
  renderActions?: (comment: CommentBlock, index: number) => React.ReactNode;
}

const CommentsTable: React.FC<CommentsTableProps> = ({ comments, renderActions }) => (
  <div className="rounded-2xl shadow-2xl overflow-hidden animate-fadeIn border border-blue-200 overflow-x-auto">
    <table className="min-w-full divide-y divide-blue-200 bg-white">
      <thead>
        <tr className="bg-gradient-to-r from-blue-600 to-blue-400">
          <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Usuario</th>
          <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Fecha</th>
          <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider">Comentario</th>
          {renderActions && (
            <th className="px-6 py-3 text-center text-xs font-extrabold text-white uppercase tracking-wider">Acciones</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-100">
        {comments.map((c, idx) => (
          <tr
            key={idx}
            className={
              `transition-colors duration-200 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-yellow-100/70` +
              ' text-gray-800 text-base'
            }
          >
            <td className="px-6 py-4 font-semibold align-middle">{c.username}</td>
            <td className="px-6 py-4 align-middle">{c.date}</td>
            <td className="px-6 py-4 align-middle whitespace-pre-line break-words max-w-none">
              {c.comment}
            </td>
            {renderActions && (
              <td className="px-6 py-4 text-center align-middle">
                {renderActions(c, idx)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
    <style>{`
      .animate-fadeIn {
        animation: fadeIn 0.7s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: none; }
      }
      .rounded-2xl::-webkit-scrollbar {
        width: 10px;
        background: #e0e7ff;
        border-radius: 8px;
      }
      .rounded-2xl::-webkit-scrollbar-thumb {
        background: #60a5fa;
        border-radius: 8px;
      }
    `}</style>
  </div>
);

export default CommentsTable;
