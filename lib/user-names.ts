import User from "@/models/User";

type Ref = { toString(): string } | null | undefined;

export async function getUserNameMap(ids: Ref[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean).map((id) => String(id))));
  if (unique.length === 0) return new Map();

  const users = await User.find({ _id: { $in: unique } })
    .select("name")
    .lean();

  return new Map(users.map((u: { _id: Ref; name: string }) => [String(u._id), u.name]));
}

// Creator and last editor for a record; legacy records without updatedBy fall back to the creator.
export function withAuthors<T extends { userId?: Ref; updatedBy?: Ref }>(
  record: T,
  names: Map<string, string>
) {
  const authorName = names.get(String(record.userId)) ?? "";
  const editorName = record.updatedBy ? names.get(String(record.updatedBy)) ?? authorName : authorName;
  return { ...record, authorName, editorName };
}
