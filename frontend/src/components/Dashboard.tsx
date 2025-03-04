import { useEffect, useState } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { Save, FileText, LogOut, Trash2, Archive } from "lucide-react";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

function Dashboard({ user, setUser }: any) {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [driveFiles, setDriveFiles] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  console.log(messageType)
  console.log(message)

  useEffect(() => {
    fetchDriveFiles();
    loadDraft();
  }, []);

  useEffect(() => {
    const autoSave = setInterval(() => {
      if (content) {
        localStorage.setItem("draftContent", content);
      }
    }, 5000);

    return () => clearInterval(autoSave);
  }, [content]);

  const logout = () => {
    fetch(`${BASE_URL}/auth/logout`, { credentials: "include" }).then(() => {
      setUser(null);
      navigate("/");
    });
  };

  const saveToGoogleDrive = async () => {
    if (!content) {
      setMessage("Please write something before saving!");
      setMessageType("error");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch(`${BASE_URL}/save-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }), 
      });
  
      const data = await res.json();
      setMessage(data.message);
      setMessageType("success");
      fetchDriveFiles();
      clearDraft();
    } catch (error) {
      console.error("Save failed", error);
      setMessage("Failed to save document");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };
  
  

  const fetchDriveFiles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/files`, {
        credentials: "include",
      });
      const data = await res.json();
      setDriveFiles(data.files);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };

  const saveDraft = () => {
    localStorage.setItem("draftContent", content);
    setMessage("Draft saved successfully!");
    setMessageType("success");
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem("draftContent");
    if (savedDraft) {
      setContent(savedDraft);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("draftContent");
    setContent("");
    setMessage("Draft cleared!");
    setMessageType("info");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br">
      {/* Header */}
      <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex justify-between items-center shadow-md sticky top-0 z-20 rounded-b-lg">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-wide">DocEdit Pro</h2>
        </div>
        <div className="flex items-center space-x-6 gap-6">
          <div className="flex items-center px-3 py-2 rounded-lg shadow-sm">
            <img
              className="w-10 h-10 rounded-full "
              src={user.photos[0].value}
              alt="Profile"
            />
            <span className="mr-3 font-medium text-sm">{user.displayName}</span>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 px-6 py-3 rounded-lg hover:bg-red-600 transition flex items-center text-white font-semibold shadow-md"
          >
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1 w-full p-6 space-x-6">
        {/* Editor Section */}
        <div className="w-2/3 p-6 flex flex-col gap-5 bg-white shadow-lg rounded-xl">
          <div className=" rounded-lg overflow-hidden shadow-sm">
            <SunEditor
              setContents={content}
              onChange={setContent}
              setOptions={{
                minHeight: "550px",
                buttonList: [
                  ["undo", "redo"],
                  ["formatBlock", "bold", "italic", "underline"],
                  ["align", "list", "table", "link", "image"],
                ],
              }}
            />
          </div>
          {/* Buttons Section */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={saveToGoogleDrive}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 p-5 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center shadow-md disabled:opacity-70"
            >
              <Save className="mr-2 h-5 w-5" />{" "}
              {loading ? "Saving..." : "Save to Google Drive"}
            </button>
            <button
              onClick={saveDraft}
              className="bg-amber-500 px-6 py-3 rounded-lg text-white hover:bg-amber-600 transition flex items-center shadow-md"
            >
              <Archive className="mr-2 h-5 w-5" /> Save Draft
            </button>
            <button
              onClick={clearDraft}
              className="bg-gray-500 px-6 py-5 rounded-lg text-white hover:bg-gray-600 transition flex items-center shadow-md"
            >
              <Trash2 className="mr-2 h-5 w-5" /> Clear Draft
            </button>
          </div>
        </div>

        {/* Saved Files Section */}
        <div className="w-1/3 p-6 bg-white shadow-lg rounded-xl border border-gray-200 sticky top-20">
          <div className="flex items-center mb-4">
            <FileText className="text-blue-600 mr-2 h-6 w-6" />
            <h3 className="text-xl font-semibold text-gray-800">
              Your Documents
            </h3>
          </div>
          {driveFiles.length > 0 ? (
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {driveFiles.map((file: any) => (
                <li
                  key={file.id}
                  className="border border-gray-300 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition shadow-sm hover:shadow-md"
                >
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="font-medium">{file.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-gray-400 text-sm mt-1">
                Save your first document to Google Drive
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
