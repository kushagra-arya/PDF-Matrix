import PropTypes from 'prop-types'

function SuccessMessage({ message, onDownload, onReset, downloadLabel = "Download File" }) {
  return (
    <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center mb-4">
        <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-green-700 dark:text-green-400 font-semibold">
          {message}
        </p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onDownload}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloadLabel}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Process Another
        </button>
      </div>
    </div>
  )
}

SuccessMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onDownload: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  downloadLabel: PropTypes.string
}

export default SuccessMessage

// okay
