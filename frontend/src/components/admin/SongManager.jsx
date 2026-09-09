import React, { useState, useEffect } from 'react';
import songService from '../../services/songService';
import { Trash2, Upload, Music, AlertCircle, CheckCircle, Loader, X, Play } from 'lucide-react';
import { usePlayback } from '../../context/PlaybackContext';

export const SongManager = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedSongModal, setUploadedSongModal] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [emotionTag, setEmotionTag] = useState('HAPPY');
  const [genre, setGenre] = useState('Ambient');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Safely retrieve usePlayback context (if present)
  let playTrack = null;
  try {
    const playback = usePlayback();
    playTrack = playback.playTrack;
  } catch (playbackErr) {
    console.warn("Playback context not available in SongManager:", playbackErr);
  }

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const data = await songService.listSongs();
      setSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load songs library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleCoverChange = (e) => {
    setCoverFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!title.trim() || !artist.trim() || !audioFile || !genre.trim()) {
      setError('Title, Artist, Genre, and Audio File are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('artist', artist.trim());
    if (album && album.trim()) {
      formData.append('album', album.trim());
    }
    formData.append('emotion_tag', emotionTag);
    formData.append('genre', genre.trim());
    formData.append('file', audioFile);
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    setUploading(true);
    try {
      const createdSong = await songService.uploadSong(formData);
      setSuccess('Song uploaded successfully.');
      setUploadedSongModal(createdSong);

      // Instantly add newly uploaded song to top of Predefined Songs Library
      if (createdSong && createdSong.id) {
        setSongs(prevSongs => [createdSong, ...prevSongs.filter(s => s && s.id !== createdSong.id)]);
      }

      setTitle('');
      setArtist('');
      setAlbum('');
      setGenre('Ambient');
      setAudioFile(null);
      setCoverFile(null);
      
      const fileInput = document.getElementById('audio-input-file');
      if (fileInput) fileInput.value = '';
      const coverInput = document.getElementById('cover-input-file');
      if (coverInput) coverInput.value = '';

      fetchSongs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload song.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (songId) => {
    const confirmMessage = "Delete this music?\n\nThis will remove the song from RhythmSense\nand delete its Cloudinary file.";
    if (!window.confirm(confirmMessage)) return;
    
    setError('');
    setSuccess('');
    try {
      await songService.deleteSong(songId);
      setSuccess('Song deleted successfully.');
      fetchSongs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete song.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Form Column */}
      <div className="space-y-8 h-fit lg:col-span-1">
        <div className="bg-harmony-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-harmony-primary">
              <Upload className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Upload New Song</h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Song Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary text-sm"
                placeholder="e.g. Moonlight Sonata"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Artist *</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary text-sm"
                placeholder="e.g. Beethoven"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Album (Optional)</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary text-sm"
                placeholder="e.g. Classical Hits"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Genre *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary text-sm"
              >
                <option value="Ambient">Ambient</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Classical">Classical</option>
                <option value="Lo-fi">Lo-fi</option>
                <option value="Jazz">Jazz</option>
                <option value="Electronic">Electronic</option>
                <option value="Acoustic">Acoustic</option>
                <option value="Instrumental">Instrumental</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Emotion Tag *</label>
              <select
                value={emotionTag}
                onChange={(e) => setEmotionTag(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary text-sm"
              >
                <option value="HAPPY">HAPPY ☀️</option>
                <option value="SAD">SAD 🌧️</option>
                <option value="CALM">CALM 🌊</option>
                <option value="ANGRY">ANGRY 🔥</option>
                <option value="FEAR">FEAR 🌑</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Audio File (.mp3, .wav) *</label>
              <input
                id="audio-input-file"
                type="file"
                accept=".mp3, .wav"
                onChange={handleFileChange}
                className="w-full text-xs text-harmony-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-harmony-primary/10 file:text-harmony-primary hover:file:bg-harmony-primary/20 file:cursor-pointer"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Cover Image (Optional)</label>
              <input
                id="cover-input-file"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full text-xs text-harmony-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-harmony-secondary/10 file:text-harmony-secondary hover:file:bg-harmony-secondary/20 file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Uploading File...
                </>
              ) : (
                'Upload Song'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Songs List Card */}
      <div className="lg:col-span-2 bg-harmony-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-harmony-secondary">
              <Music className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Predefined Songs Library</h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-harmony-muted font-semibold">
            {(Array.isArray(songs) ? songs : []).length} songs
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-harmony-primary animate-spin" />
          </div>
        ) : (!Array.isArray(songs) || songs.length === 0) ? (
          <div className="text-center py-20 text-harmony-muted text-sm border border-dashed border-white/5 rounded-xl">
            No songs uploaded yet. Use the upload panel to seed songs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-harmony-muted">
              <thead>
                <tr className="border-b border-white/5 text-white/50 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Artist</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Emotion</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {songs.map((song) => {
                  if (!song) return null;
                  const isJamendo = song.source === 'jamendo' || (song.id && typeof song.id === 'string' && song.id.startsWith('jamendo_'));
                  const songId = song.id || '';
                  
                  return (
                    <tr key={songId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white truncate max-w-[150px]">
                        {song.title}
                      </td>
                      <td className="py-3 px-4 truncate max-w-[120px]">{song.artist}</td>
                      <td className="py-3 px-4 truncate max-w-[100px]">{song.genre || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          song.emotion_tag === 'HAPPY' ? 'bg-amber-500/10 text-amber-400' :
                          song.emotion_tag === 'SAD' ? 'bg-blue-500/10 text-blue-400' :
                          song.emotion_tag === 'CALM' ? 'bg-emerald-500/10 text-emerald-400' :
                          song.emotion_tag === 'ANGRY' ? 'bg-red-500/10 text-red-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {song.emotion_tag}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {song.source || (isJamendo ? 'jamendo' : 'local')}
                      </td>
                      <td className="py-3 px-4">
                        {song.duration ? `${Math.round(song.duration)}s` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-1">
                        {playTrack && (
                          <button
                            onClick={() => playTrack(song, false, songs)}
                            className="p-2 text-harmony-muted hover:text-harmony-primary hover:bg-harmony-primary/10 rounded-xl transition-all"
                            title="Preview Song"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {!isJamendo && songId && (
                          <button
                            onClick={() => handleDelete(songId)}
                            className="p-2 text-harmony-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Delete Song"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Success Popup Modal */}
      {uploadedSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#13111C] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 text-center relative">
            <button
              onClick={() => setUploadedSongModal(null)}
              className="absolute top-4 right-4 p-1 rounded-xl text-harmony-muted hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Song Successfully Stored!</h3>
              <p className="text-xs text-harmony-muted">Your uploaded song is saved in the predefined library & Cloudinary</p>
            </div>

            <div className="bg-[#1B1926] border border-white/5 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-harmony-muted">Title:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{uploadedSongModal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-harmony-muted">Artist:</span>
                <span className="font-semibold text-white">{uploadedSongModal.artist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-harmony-muted">Genre:</span>
                <span className="font-semibold text-white">{uploadedSongModal.genre || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-harmony-muted">Emotion Tag:</span>
                <span className="font-bold text-amber-400">{uploadedSongModal.emotion_tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-harmony-muted">Storage:</span>
                <span className="font-semibold text-emerald-400">Cloudinary + Predefined Library</span>
              </div>
            </div>

            <button
              onClick={() => setUploadedSongModal(null)}
              className="w-full py-3 bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongManager;
