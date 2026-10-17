using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace DceayMusicApp
{
    static class Program
    {
        private static HttpListener? listener;
        private static Thread? serverThread;
        private static bool isRunning = true;
        private static int port = 38472;

        [STAThread]
        static void Main()
        {
            StartLocalServer();

            string appUrl = $"http://127.0.0.1:{port}/index.html";

            // Find Edge executable on system
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath))
            {
                edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
            }

            string userDataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "DceayMusicApp", "Profile"
            );
            Directory.CreateDirectory(userDataDir);

            if (File.Exists(edgePath))
            {
                var psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = $"--app=\"{appUrl}\" --window-size=1280,820 --user-data-dir=\"{userDataDir}\" --class=\"DceayMusicApp\"",
                    UseShellExecute = false
                };

                try
                {
                    var proc = Process.Start(psi);
                    if (proc != null)
                    {
                        proc.WaitForExit();
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Failed to launch application window: " + ex.Message);
                }
            }
            else
            {
                // Fallback: open default browser
                Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
            }

            StopLocalServer();
        }

        private static void StartLocalServer()
        {
            serverThread = new Thread(() =>
            {
                try
                {
                    listener = new HttpListener();
                    listener.Prefixes.Add($"http://127.0.0.1:{port}/");
                    listener.Start();

                    string wwwPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "www");
                    if (!Directory.Exists(wwwPath))
                    {
                        wwwPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\..\app"));
                    }

                    while (isRunning && listener.IsListening)
                    {
                        var context = listener.GetContext();
                        ThreadPool.QueueUserWorkItem((c) => ProcessRequest((HttpListenerContext)c!, wwwPath), context);
                    }
                }
                catch { }
            })
            { IsBackground = true };

            serverThread.Start();
        }

        private static void ProcessRequest(HttpListenerContext context, string rootDir)
        {
            try
            {
                string relPath = context.Request.Url!.LocalPath.TrimStart('/');
                if (string.IsNullOrEmpty(relPath)) relPath = "index.html";

                string filePath = Path.Combine(rootDir, relPath.Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(filePath))
                {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLower();

                    context.Response.ContentType = ext switch
                    {
                        ".html" => "text/html",
                        ".css" => "text/css",
                        ".js" => "application/javascript",
                        ".svg" => "image/svg+xml",
                        ".png" => "image/png",
                        ".wav" => "audio/wav",
                        ".mp3" => "audio/mpeg",
                        ".json" => "application/json",
                        _ => "application/octet-stream"
                    };

                    context.Response.ContentLength64 = bytes.Length;
                    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                }
                else
                {
                    context.Response.StatusCode = 404;
                    byte[] err = Encoding.UTF8.GetBytes("Not Found");
                    context.Response.OutputStream.Write(err, 0, err.Length);
                }
            }
            catch { }
            finally
            {
                try { context.Response.OutputStream.Close(); } catch { }
            }
        }

        private static void StopLocalServer()
        {
            isRunning = false;
            try { listener?.Stop(); } catch { }
            try { listener?.Close(); } catch { }
        }
    }
}