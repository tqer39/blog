'use client';

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useEscapeKey,
} from '@blog/ui';
import { X } from 'lucide-react';
import { useI18n } from '@/i18n';

interface EditorModalProps {
  /** モーダルのタイトル */
  title: string;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** 保存時のコールバック */
  onSave: () => void;
  /** 保存中かどうか */
  isSaving: boolean;
  /** 編集モードかどうか (新規作成の場合は false) */
  isEditing: boolean;
  /** エラーメッセージ (null の場合は表示しない) */
  error: string | null;
  /** フォームフィールド */
  children: React.ReactNode;
}

/**
 * 管理画面のエディタモーダル共通コンポーネント。
 *
 * @example
 * <EditorModal
 *   title={isEditing ? 'Edit Tag' : 'Create Tag'}
 *   onClose={onClose}
 *   onSave={handleSave}
 *   isSaving={isSaving}
 *   isEditing={isEditing}
 *   error={error}
 * >
 *   <div className="space-y-2">
 *     <Label htmlFor="tag-name">Name</Label>
 *     <Input id="tag-name" value={name} onChange={...} />
 *   </div>
 * </EditorModal>
 */
export function EditorModal({
  title,
  onClose,
  onSave,
  isSaving,
  isEditing,
  error,
  children,
}: EditorModalProps) {
  const { t } = useI18n();
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">{t('common.close')}</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {children}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving
                ? t('common.saving')
                : isEditing
                  ? t('common.update')
                  : t('common.create')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
