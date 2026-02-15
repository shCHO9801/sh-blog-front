export default function ProfileCard({
  nickname,
  profileImageUrl,
}: {
  nickname: string;
  profileImageUrl: string;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="profile"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </div>
        <div>
          <div className="text-sm font-semibold">{nickname}</div>
          <div className="text-xs text-neutral-500">Personal blog</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-neutral-500">black & white · minimal</div>
    </aside>
  );
}
