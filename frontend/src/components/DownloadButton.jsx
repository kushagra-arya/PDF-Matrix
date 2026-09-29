function DownloadButton({ fileUrl, fileName = "download", onDownloadComplete }) {
  const handleDownload = async () => {
    try {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      if (onDownloadComplete) {
        onDownloadComplete()
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="btn-primary w-full flex items-center justify-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Download {fileName}</span>
    </button>
  )
}

export default DownloadButton

// okay
