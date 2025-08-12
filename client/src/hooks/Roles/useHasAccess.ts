import { useMemo, useCallback, useContext } from 'react';
import type { TUser, PermissionTypes, Permissions } from 'librechat-data-provider';
import { AuthContext } from '~/hooks/AuthContext';

const useHasAccess = ({
  permissionType,
  permission,
  isAdminAccessNeeded,
}: {
  permissionType: PermissionTypes;
  permission: Permissions;
  isAdminAccessNeeded?: boolean | null;
}) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const roles = authContext?.roles;
  const isAuthenticated = authContext?.isAuthenticated || false;

  const checkAccess = useCallback(
    ({
      user,
      permissionType,
      permission,
    }: {
      user?: TUser | null;
      permissionType: PermissionTypes;
      permission: Permissions;
    }) => {
      if (!authContext) {
        return false;
      }

      if (isAdminAccessNeeded && user?.role != 'ADMIN') {
        return false;
      }

      if (isAuthenticated && user?.role != null && roles && roles[user.role]) {
        return roles[user.role]?.permissions?.[permissionType]?.[permission] === true;
      }
      return false;
    },
    [authContext, isAuthenticated, roles],
  );

  const hasAccess = useMemo(
    () => checkAccess({ user, permissionType, permission }),
    [user, permissionType, permission, checkAccess],
  );

  return hasAccess;
};

export default useHasAccess;
