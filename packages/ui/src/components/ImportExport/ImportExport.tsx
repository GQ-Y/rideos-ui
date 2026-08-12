import { useState } from "react";
import type { ReactNode } from "react";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Alert } from "../Alert";
import { Button } from "../Button";
import { Link } from "../Link";
import { Modal } from "../Modal";
import { Upload } from "../Upload";
import type { UploadFile } from "../Upload";

export interface ImportResult {
  /** 成功条数 */
  success: number;
  /** 失败条数 */
  failed: number;
  /** 失败明细(展示前几条) */
  errors?: string[];
}

export interface ImportExportProps {
  /** 点击导出 */
  onExport?: () => void;
  /**
   * 执行导入:返回结果(支持异步);抛错视为导入失败
   */
  onImport?: (file: File) => ImportResult | Promise<ImportResult>;
  /** 下载导入模板 */
  onDownloadTemplate?: () => void;
  /** 接受的文件类型,默认 .xlsx,.csv */
  accept?: string;
  exportText?: ReactNode;
  importText?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * 导入导出(Pro):导出按钮 + 导入弹窗(模板下载 / 拖拽上传 / 结果反馈)
 */
export function ImportExport({
  onExport,
  onImport,
  onDownloadTemplate,
  accept = ".xlsx,.csv",
  exportText = "导出",
  importText = "导入",
  disabled = false,
  className,
}: ImportExportProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  function reset() {
    setResult(null);
    setError(null);
    setFileList([]);
    setImporting(false);
  }

  async function runImport(file: File) {
    if (!onImport) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const next = await onImport(file);
      setResult(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "导入失败,请检查文件格式");
    } finally {
      setImporting(false);
    }
  }

  return (
    <span className={className} style={{ display: "inline-flex", gap: 8 }}>
      {onExport && (
        <Button disabled={disabled} onClick={onExport}>
          <DownloadOutlined /> {exportText}
        </Button>
      )}
      {onImport && (
        <Button
          variant="primary"
          disabled={disabled}
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          <UploadOutlined /> {importText}
        </Button>
      )}
      <Modal
        open={open}
        title="批量导入"
        width={480}
        onClose={() => setOpen(false)}
        footer={<Button onClick={() => setOpen(false)}>关闭</Button>}
      >
        {onDownloadTemplate && (
          <p className="rideos-modal-hint">
            第一步:下载
            <Link onClick={onDownloadTemplate}>导入模板</Link>
            并按格式填写;第二步:上传填好的文件。
          </p>
        )}
        <Upload
          drag
          accept={accept}
          maxCount={1}
          fileList={fileList}
          onChange={setFileList}
          beforeUpload={(file) => {
            void runImport(file);
            return true;
          }}
        />
        {importing && <Alert type="info" message="正在导入,请稍候..." />}
        {result && (
          <Alert
            type={result.failed > 0 ? "warning" : "success"}
            message={`导入完成:成功 ${result.success} 条,失败 ${result.failed} 条`}
            description={
              result.errors && result.errors.length > 0 ? (
                <span>
                  {result.errors.slice(0, 3).map((item) => (
                    <span key={item} style={{ display: "block" }}>
                      {item}
                    </span>
                  ))}
                </span>
              ) : undefined
            }
          />
        )}
        {error && <Alert type="error" message={error} />}
      </Modal>
    </span>
  );
}
