// 화면 권한 판단 (버튼 노출용). 실제 권한 검사는 백엔드가 한다 (gomachine/model.json).
//   - 게시글: 로그인 사용자는 모두 읽고 (read: "login"), 수정 / 삭제는 작성자(board.user)만 한다.
//   - 회원: 본인 행만 읽고 고친다. level 이 ADMIN_LEVEL 이상이면 관리자 (모든 회원).

/** 관리자 level. gomachine/model.json 의 adminLevel 과 같아야 한다. */
export const ADMIN_LEVEL = 3

interface Viewer {
  id: number
  level?: number | null
}

export function isAdmin(user: Viewer | null | undefined): boolean {
  return (user?.level ?? 0) >= ADMIN_LEVEL
}

/** 게시글 작성자인가 (board.user = 작성자 id). */
export function isOwner(
  user: Viewer | null | undefined,
  board: { user: number } | null | undefined,
): boolean {
  return !!user && !!board && user.id === board.user
}

/** 회원 정보를 고치거나 지울 수 있는가 (본인 또는 관리자). */
export function canManageUser(
  user: Viewer | null | undefined,
  targetId: number,
): boolean {
  return !!user && (user.id === targetId || isAdmin(user))
}
