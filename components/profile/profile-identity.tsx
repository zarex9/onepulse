import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { MiniAppUser } from "@/components/profile"

export function ProfileIdentity({ user }: { user: MiniAppUser }) {
  if (!user) return null
  return (
    <Item variant="outline">
      <ItemMedia>
        <Avatar className="size-16">
          <AvatarImage src={user.pfpUrl} alt={user.displayName} />
          <AvatarFallback>User</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{user.displayName}</ItemTitle>
        <ItemDescription>@{user.username}</ItemDescription>
        <ItemDescription>FID: {user.fid}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
