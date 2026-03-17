import * as React from "react";

export function Progress({ value = 0 }) {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}