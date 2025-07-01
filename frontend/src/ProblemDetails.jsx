<div className="max-w-5xl mx-auto p-4 space-y-6">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <div>
      <h1 className="text-3xl font-bold">{problem?.name}</h1>
      <div className="flex gap-2 mt-2">
        {problem?.tags?.split(',').map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{tag}</span>
        ))}
      </div>
    </div>
    <span className={`px-4 py-1 rounded-full text-white font-semibold ${problem?.difficulty === 'Easy' ? 'bg-green-500' : problem?.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
      {problem?.difficulty}
    </span>
  </div>

  {/* Problem Statement */}
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <h2 className="text-xl font-semibold">Problem Statement</h2>
    <p className="text-gray-700 whitespace-pre-line">{problem?.description}</p>
    <div>
      <h3 className="font-semibold">Constraints</h3>
      <p className="text-gray-600 whitespace-pre-line">{problem?.constraints}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold">Sample Input</h4>
        <pre className="bg-gray-100 p-2 rounded">{problem?.showtc}</pre>
      </div>
      <div>
        <h4 className="font-semibold">Sample Output</h4>
        <pre className="bg-gray-100 p-2 rounded">{problem?.showoutput}</pre>
      </div>
    </div>
  </div>

  {/* Language & Theme Selectors */}
  <div className="flex flex-col md:flex-row gap-4 items-center">
    <div>
      <label className="mr-2 font-medium">Language:</label>
      <select
        value={language}
        onChange={e => setLanguage(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
      </select>
    </div>
    <div>
      <label className="mr-2 font-medium">Theme:</label>
      <select
        value={theme}
        onChange={e => setTheme(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="light">Light</option>
        <option value="vs-dark">Dark</option>
      </select>
    </div>
  </div>

  {/* Code Editor */}
  <div className="bg-white rounded-lg shadow p-4">
    <CodeEditor
      value={code}
      language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
      onChange={setCode}
      height="350px"
      theme={theme}
    />
  </div>

  {/* Custom Input & Output */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-white rounded-lg shadow p-4">
      <label className="block font-medium mb-2">Custom Input</label>
      <CodeEditor
        value={input}
        language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
        onChange={setInput}
        height="120px"
      />
    </div>
    <div className="bg-white rounded-lg shadow p-4">
      <label className="block font-medium mb-2">Output</label>
      <CodeEditor
        value={customOutput}
        language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
        onChange={() => {}}
        height="120px"
        readOnly={true}
      />
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-4 justify-end">
    <button
      onClick={handleRun}
      disabled={runStatus === 'running' || !isAuthenticated}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
    >
      {runStatus === 'running' ? 'Running...' : 'Run'}
    </button>
    <button
      onClick={handleSubmit}
      disabled={submissionStatus === 'submitting' || !isAuthenticated}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
    >
      {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit'}
    </button>
    <button
      onClick={handleAiReview}
      disabled={loadingReview || !code.trim()}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
    >
      {loadingReview ? 'Reviewing...' : 'AI Review'}
    </button>
  </div>

  {/* Verdict/Feedback */}
  {submissionStatus && (
    <div className="mt-4 p-4 rounded bg-gray-50 border">
      <h3 className="font-semibold mb-2">Verdict / Feedback</h3>
      {submissionStatus === 'success' && <div className="text-green-700">Solution submitted successfully!</div>}
      {submissionStatus === 'wrong' && <div className="text-red-700">Wrong answer! Your solution did not pass all test cases.</div>}
      {submissionStatus === 'runtime_error' && <div className="text-orange-700">Runtime error occurred while running your code.</div>}
      {submissionError && <div className="text-red-700">{submissionError}</div>}
    </div>
  )}

  {/* AI Review */}
  <div className="mt-4 p-4 rounded bg-gray-50 border">
    <h3 className="font-semibold mb-2">AI Review</h3>
    <div className="text-gray-800 whitespace-pre-wrap min-h-[40px]">{aiReview}</div>
  </div>
</div>