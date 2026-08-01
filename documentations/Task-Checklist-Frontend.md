**TASK CHECKLIST — FRONTEND**
**Discord-Like Web Application — Project-Based Learning**
*Fase 10 — Pelengkap: Task Checklist khusus Frontend (React/Vite/TanStack Query/Zustand/TailwindCSS)*

# Pendahuluan
Task Checklist sebelumnya berfokus pada implementasi Backend (Express.js, Prisma, WebSocket server, dsb.). Dokumen ini melengkapinya dengan Task Checklist khusus Frontend, mengikuti struktur yang sama (Epic → Feature → Task → Subtask → Checklist) dan urutan Epic/Feature yang identik (7 Epic mengikuti rilis v0.1-v0.7, 19 Feature mengikuti Sprint S1-S19 pada Sprint Breakdown), agar kedua checklist dapat dikerjakan berdampingan per sprint.
Frontend menggunakan stack React, React Router, TanStack Query (data fetching & caching), Zustand (state management ringan seperti auth/presence/UI state), TailwindCSS (styling sesuai design token UI/UX Specification), dan Vite (build tool), sesuai keputusan sejak Vision Document/ADR.
Total 22 Task Frontend tercakup pada dokumen ini, mencakup seluruh layar dan komponen yang telah dirinci pada UI/UX Specification (Fase 7), termasuk dukungan poll multiple-choice (FE16.1) dan integrasi keamanan sisi client (FE17.1).

# EPIC 1 — Foundation (v0.1)

## Feature S1 — Frontend Project Setup

**FE1.1 — Setup Vite + React + Router + TailwindCSS**
| **Deskripsi** | Inisialisasi proyek frontend dengan Vite, konfigurasi React Router untuk routing dasar, dan TailwindCSS dengan design token dark theme sesuai UI/UX Specification. |
| --- | --- |
| **Acceptance Criteria** | 1. Proyek dapat dijalankan via `npm run dev` tanpa error.  2. Palet warna & tipografi TailwindCSS terkonfigurasi sesuai UI/UX Specification Bagian 2.  3. Routing dasar (/login, /app) sudah dapat dinavigasi. |
| **Dependency** | Tidak ada (task pertama frontend). |
| **Priority** | Must |
| **Estimasi Kesulitan** | Easy |
| **Estimasi Waktu** | 6 jam |
| **Definition of Done** | Skeleton frontend siap menjadi fondasi seluruh halaman berikutnya. |

**Subtask:**
- Inisialisasi proyek Vite (React + TypeScript template).
- Install & konfigurasi TailwindCSS beserta custom theme (warna, font) dari UI/UX Specification.
- Setup React Router dengan route dasar & layout shell.
- Integrasikan Biome untuk linting frontend.

**Checklist Verifikasi:**
- npm run dev berjalan tanpa error
- Warna & font sesuai token UI/UX Specification
- Navigasi antar route dasar berfungsi

**FE1.2 — API Client & State Management Setup**
| **Deskripsi** | Setup TanStack Query client, Zustand store dasar (auth, ui), serta wrapper HTTP client yang menyisipkan Bearer token dan menangani refresh token otomatis. |
| --- | --- |
| **Acceptance Criteria** | 1. Request ke API terproteksi otomatis menyertakan header Authorization.  2. Access token kedaluwarsa otomatis di-refresh tanpa memaksa pengguna login ulang.  3. Kegagalan refresh (refresh token invalid) mengarahkan pengguna ke halaman login. |
| **Dependency** | FE1.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Seluruh halaman berikutnya dapat memanggil API terproteksi tanpa menangani token secara manual. |

**Subtask:**
- Setup QueryClient & Provider TanStack Query.
- Buat Zustand store authStore (accessToken in-memory, user profile).
- Buat HTTP client wrapper dengan interceptor refresh token.
- Buat Zustand store uiStore (modal, toast, sidebar toggle state).

**Checklist Verifikasi:**
- Access token otomatis di-refresh saat kedaluwarsa
- Request gagal 401 setelah refresh gagal mengarahkan ke /login

## Feature S2 — Auth UI

**FE2.1 — Halaman Login & Register**
| **Deskripsi** | Membangun form Login dan Register sesuai UI/UX Specification Bagian 5.1, dengan validasi inline dan integrasi ke endpoint auth. |
| --- | --- |
| **Acceptance Criteria** | 1. Validasi inline (format email, kekuatan password) tampil sebelum submit.  2. Login sukses menyimpan token ke authStore & redirect ke /app.  3. Error kredensial salah ditampilkan sebagai pesan generik sesuai Security Design. |
| **Dependency** | FE1.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Pengguna dapat register & login sepenuhnya melalui UI. |

**Subtask:**
- Bangun komponen form Login & Register (toggle dalam satu card).
- Integrasikan validasi Zod di sisi client (mirror validasi backend).
- Hubungkan ke endpoint POST /auth/register & /auth/login via TanStack Query mutation.
- Tangani & tampilkan error dari API (mis. 409 Conflict, 400 Validation).

**Checklist Verifikasi:**
- Register & login berhasil end-to-end dari UI
- Pesan error ditampilkan sesuai format error API

**FE2.2 — Halaman Sesi & Perangkat**
| **Deskripsi** | Sub-halaman User Settings untuk menampilkan daftar sesi aktif dan mencabut sesi tertentu, sesuai UI/UX Specification Bagian 5.6. |
| --- | --- |
| **Acceptance Criteria** | 1. Daftar sesi menampilkan device_info, ip_address, dan waktu login.  2. Mencabut sesi langsung menghilangkan item dari daftar tanpa reload halaman penuh. |
| **Dependency** | FE2.1 |
| **Priority** | Should |
| **Estimasi Kesulitan** | Easy |
| **Estimasi Waktu** | 5 jam |
| **Definition of Done** | Pengguna dapat melihat & mengelola perangkat/sesi aktifnya dari UI. |

**Subtask:**
- Bangun komponen daftar sesi dengan TanStack Query (GET /auth/sessions).
- Implementasikan aksi revoke sesi (DELETE /auth/sessions/{id}) dengan optimistic update.
- Tambahkan modal konfirmasi sebelum revoke.

**Checklist Verifikasi:**
- Revoke sesi berhasil & list ter-update otomatis
- Sesi yang sedang aktif (current session) ditandai berbeda

# EPIC 2 — Workspace & Permission (v0.2)

## Feature S3 — Server UI

**FE3.1 — Server Rail & Modal Create/Join Server**
| **Deskripsi** | Komponen Server Rail (ikon server vertikal) beserta modal untuk membuat atau bergabung ke server, sesuai wireframe UI/UX Specification Gambar 1. |
| --- | --- |
| **Acceptance Criteria** | 1. Server Rail menampilkan seluruh server yang diikuti pengguna dengan indikator aktif.  2. Modal Create Server berhasil membuat server baru & otomatis menambahkannya ke Server Rail. |
| **Dependency** | FE1.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Pengguna dapat membuat/bergabung server dan berpindah antar server dari UI. |

**Subtask:**
- Bangun komponen Server Rail dengan state server aktif (Zustand).
- Bangun modal Create Server (form nama & ikon) terhubung ke POST /servers.
- Bangun modal Join Server (jika menggunakan invite link/code).

**Checklist Verifikasi:**
- Server baru muncul di Server Rail tanpa reload
- Server aktif ter-highlight sesuai desain UI/UX Specification

## Feature S4 — Channel Sidebar & Role Management UI

**FE4.1 — Channel Sidebar (Category & Channel Tree)**
| **Deskripsi** | Sidebar channel dengan pengelompokan category, ikon per tipe channel, dan modal CRUD category/channel sesuai wireframe. |
| --- | --- |
| **Acceptance Criteria** | 1. Channel dikelompokkan per category sesuai urutan posisi dari API.  2. Channel unread ditandai bold + dot indicator sesuai UI/UX Specification Bagian 2.4. |
| **Dependency** | FE3.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 9 jam |
| **Definition of Done** | Navigasi channel dalam server berfungsi penuh sesuai SRS-WS-02. |

**Subtask:**
- Bangun komponen tree Category → Channel dengan ikon per tipe (#, 🔊, 📢, 🧵).
- Bangun modal create/edit category & channel.
- Implementasikan state unread per channel (Zustand/TanStack Query cache).

**Checklist Verifikasi:**
- Channel sidebar menampilkan struktur sesuai data API
- Modal create/edit channel berhasil memperbarui sidebar secara realtime

**FE4.2 — UI Manajemen Role & Permission**
| **Deskripsi** | Halaman pengaturan server untuk membuat role kustom, mengatur permission (checkbox per permission), dan meng-assign role ke member. |
| --- | --- |
| **Acceptance Criteria** | 1. Permission yang ditampilkan sebagai opsi dibatasi agar tidak melebihi permission aktor sendiri (mirror SRS-PERM-01 di sisi UI).  2. Assignment role ke member tersimpan & tercermin langsung di daftar member. |
| **Dependency** | FE4.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Hard |
| **Estimasi Waktu** | 10 jam |
| **Definition of Done** | Server Owner/Moderator dapat mengelola role & permission sepenuhnya dari UI. |

**Subtask:**
- Bangun UI daftar role dengan warna & posisi hierarki.
- Bangun form create/edit role dengan checkbox permission granular.
- Bangun UI assignment role per member.
- Bangun UI channel permission override (allow/deny per role/member).

**Checklist Verifikasi:**
- Role baru tidak dapat memilih permission di luar izin aktor (tombol/checkbox disabled)
- Assignment role & override channel tersimpan dengan benar

# EPIC 3 — Realtime Messaging Core (v0.3)

## Feature S5 — WebSocket Client Integration

**FE5.1 — WebSocket Client Hook & Connection Lifecycle**
| **Deskripsi** | Custom hook (useWebSocket) yang mengelola koneksi WebSocket, autentikasi handshake, reconnection dengan backoff, dan sinkronisasi ulang state saat reconnect. |
| --- | --- |
| **Acceptance Criteria** | 1. Koneksi otomatis reconnect dengan backoff saat terputus.  2. Saat reconnect berhasil, klien melakukan sinkronisasi ulang (fetch pesan terbaru) untuk menutup celah event yang terlewat. |
| **Dependency** | FE1.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Hard |
| **Estimasi Waktu** | 9 jam |
| **Definition of Done** | Fondasi WebSocket client siap dipakai seluruh fitur realtime berikutnya. |

**Subtask:**
- Buat hook useWebSocket dengan state connecting/connected/disconnected.
- Implementasikan strategi reconnect exponential backoff.
- Implementasikan sinkronisasi ulang state (presence, pesan) setelah reconnect.
- Buat event dispatcher untuk meneruskan event ke Zustand store/TanStack Query cache terkait.

**Checklist Verifikasi:**
- Koneksi pulih otomatis setelah jaringan sempat terputus
- Tidak ada pesan yang hilang secara permanen setelah reconnect (diuji manual)

## Feature S6 — Chat UI Core

**FE6.1 — Message List & Composer**
| **Deskripsi** | Komponen Message List dengan infinite scroll & grouping pesan, serta Message Composer dengan optimistic send dan mention autocomplete. |
| --- | --- |
| **Acceptance Criteria** | 1. Pesan baru tampil optimis (pending state) sebelum konfirmasi server, lalu berubah status setelah sukses/gagal.  2. Scroll ke atas memuat pesan lama tanpa kehilangan posisi scroll saat ini.  3. Mention menampilkan autocomplete daftar member saat mengetik '@'. |
| **Dependency** | FE5.1, FE4.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Hard |
| **Estimasi Waktu** | 14 jam |
| **Definition of Done** | Pengalaman chat inti berfungsi mulus sesuai UI/UX Specification Bagian 5.2. |

**Subtask:**
- Bangun komponen Message List dengan infinite scroll (cursor pagination TanStack Query).
- Bangun grouping pesan berurutan dari pengirim sama.
- Bangun Message Composer dengan textarea auto-resize, attach, emoji picker trigger.
- Implementasikan optimistic UI untuk pengiriman pesan.
- Implementasikan mention autocomplete.

**Checklist Verifikasi:**
- Infinite scroll memuat pesan lama tanpa jank/reset posisi
- Pesan gagal terkirim menampilkan state 'failed' dengan opsi retry

## Feature S7 — Reactions/Pin UI

**FE7.1 — Reaction Picker & Pin UI**
| **Deskripsi** | UI untuk menambah reaksi emoji pada pesan (hover action) dan menyematkan pesan, termasuk panel daftar pesan yang di-pin. |
| --- | --- |
| **Acceptance Criteria** | 1. Reaction picker muncul saat hover/tap pesan.  2. Panel pesan ter-pin dapat dibuka dari Top Bar channel. |
| **Dependency** | FE6.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Easy |
| **Estimasi Waktu** | 6 jam |
| **Definition of Done** | Reaksi & pin dapat digunakan sepenuhnya dari UI sesuai FR-MSG-04/06. |

**Subtask:**
- Bangun komponen reaction picker (emoji shortlist + full picker).
- Bangun UI badge reaksi di bawah pesan dengan jumlah & tooltip nama pengguna.
- Bangun panel daftar pesan ter-pin.

**Checklist Verifikasi:**
- Reaksi bertambah/berkurang realtime tanpa reload
- Panel pin menampilkan seluruh pesan ter-pin channel terkait

## Feature S8 — Presence & Typing UI

**FE8.1 — Indikator Presence pada Avatar & Member List**
| **Deskripsi** | Menampilkan status presence (online/idle/DND/offline) sebagai indikator warna pada avatar di seluruh tempat avatar muncul. |
| --- | --- |
| **Acceptance Criteria** | 1. Indikator presence konsisten di Server Rail, Message List, dan Member List.  2. Perubahan status tersinkron realtime tanpa refresh. |
| **Dependency** | FE5.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 6 jam |
| **Definition of Done** | Presence tampil konsisten di seluruh bagian aplikasi sesuai FR-PRES-01. |

**Subtask:**
- Buat komponen Avatar dengan prop status presence.
- Hubungkan state presence dari WebSocket event ke store global presence.
- Terapkan komponen Avatar ke Member List, Message List, dan DM list.

**Checklist Verifikasi:**
- Perubahan presence user lain terlihat realtime di seluruh tempat relevan
- Warna indikator sesuai token UI/UX Specification (online/idle/DND/offline)

**FE8.2 — Typing Indicator & Read Receipt UI**
| **Deskripsi** | Baris kecil 'sedang mengetik...' di atas Composer, dan indikator telah dibaca pada pesan. |
| --- | --- |
| **Acceptance Criteria** | 1. Typing indicator muncul dalam <1 detik setelah user lain mulai mengetik dan hilang otomatis setelah beberapa detik idle. |
| **Dependency** | FE8.1, FE6.1 |
| **Priority** | Should |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 5 jam |
| **Definition of Done** | Typing indicator & read receipt berfungsi sesuai FR-PRES-02/03. |

**Subtask:**
- Kirim event typing dari Composer (debounced) ke WebSocket.
- Render baris typing indicator dari event yang diterima.
- Render indikator read receipt pada pesan terakhir yang dibaca.

**Checklist Verifikasi:**
- Typing indicator tidak mengedip berlebihan saat banyak user mengetik
- Read receipt terupdate saat channel dibuka

# EPIC 4 — Engagement Features (v0.4)

## Feature S9 — Notification UI

**FE9.1 — Notification Panel & Toast**
| **Deskripsi** | Panel dropdown notifikasi dari ikon lonceng, serta toast untuk notifikasi realtime yang muncul saat pengguna sedang aktif di aplikasi. |
| --- | --- |
| **Acceptance Criteria** | 1. Badge angka pada ikon lonceng menampilkan jumlah notifikasi belum dibaca.  2. Klik notifikasi mengarahkan ke pesan/konteks terkait dan menandainya terbaca. |
| **Dependency** | FE5.1, FE1.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 7 jam |
| **Definition of Done** | Notifikasi realtime tampil & dapat dikelola sepenuhnya dari UI sesuai FR-NOTIF-01. |

**Subtask:**
- Bangun komponen dropdown Notification Panel (GET /notifications).
- Bangun komponen toast untuk notifikasi realtime baru.
- Implementasikan aksi mark-as-read (PATCH /notifications/{id}/read) dengan optimistic update.

**Checklist Verifikasi:**
- Badge unread count akurat & ter-update realtime
- Klik notifikasi membawa ke konteks pesan yang benar

## Feature S10 — Upload UI

**FE10.1 — Attach File & Progress Upload Langsung ke Cloudinary**
| **Deskripsi** | Komponen attach file pada Composer dengan preview, validasi tipe/ukuran di sisi client, dan progress bar upload langsung ke Cloudinary (direct upload). |
| --- | --- |
| **Acceptance Criteria** | 1. File melebihi 1GB ditolak di sisi client sebelum request signed URL dikirim.  2. Progress upload ditampilkan realtime hingga selesai. |
| **Dependency** | FE6.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Pengguna dapat melampirkan file ke pesan end-to-end sesuai FR-UP-01. |

**Subtask:**
- Bangun komponen file picker & preview attachment sebelum kirim.
- Implementasikan alur signed URL (POST /uploads/signed-url) & upload langsung ke Cloudinary.
- Implementasikan progress bar upload & error handling.

**Checklist Verifikasi:**
- Upload besar (mendekati 1GB) menampilkan progress yang akurat
- File tidak valid ditolak dengan pesan jelas sebelum upload dimulai

## Feature S11 — Search UI

**FE11.1 — Search Overlay**
| **Deskripsi** | Modal overlay pencarian full-width dengan filter cepat dan hasil dikelompokkan per tipe entitas, sesuai UI/UX Specification Bagian 5.4. |
| --- | --- |
| **Acceptance Criteria** | 1. Hasil pencarian dikelompokkan (pesan, file, channel, user) dan dapat difilter.  2. Klik hasil pesan membawa pengguna langsung ke lokasi pesan pada channel terkait. |
| **Dependency** | FE1.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 7 jam |
| **Definition of Done** | Pencarian lintas entitas dapat digunakan sepenuhnya dari UI sesuai FR-SRC-01. |

**Subtask:**
- Bangun modal Search Overlay dengan input debounce.
- Integrasikan ke GET /search dengan filter tipe & konteks server/channel.
- Implementasikan navigasi 'jump to message' dari hasil pencarian.

**Checklist Verifikasi:**
- Pencarian menampilkan hasil relevan sesuai filter
- Jump to message berhasil scroll & highlight pesan target

# EPIC 5 — Voice & Video (v0.5)

## Feature S12 — Token Fetch & LiveKit Client Setup

**FE12.1 — Hook Voice/Video Token & Inisialisasi LiveKit Client**
| **Deskripsi** | Custom hook untuk meminta token LiveKit dari backend dan menginisialisasi LiveKit Client SDK di frontend. |
| --- | --- |
| **Acceptance Criteria** | 1. Token diminta hanya saat pengguna eksplisit ingin join voice/video channel.  2. Kegagalan permintaan token (mis. 403) ditampilkan sebagai pesan error jelas. |
| **Dependency** | FE1.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 6 jam |
| **Definition of Done** | Fondasi integrasi LiveKit di sisi client siap dipakai fitur voice & video. |

**Subtask:**
- Buat hook useVoiceToken (POST /channels/{id}/voice/token).
- Inisialisasi LiveKit Client SDK dengan token & livekitUrl dari response.
- Tangani error permission/koneksi dari hook ini.

**Checklist Verifikasi:**
- Token berhasil didapat & dipakai untuk konek ke LiveKit
- Error permission/koneksi tertangkap & ditampilkan ke pengguna

## Feature S13 — Voice Channel UI

**FE13.1 — Kontrol Voice Channel (Join/Leave/Mute)**
| **Deskripsi** | UI kontrol voice channel yang selalu terlihat (docked) saat pengguna berada dalam voice channel, dengan sinkronisasi ke Presence. |
| --- | --- |
| **Acceptance Criteria** | 1. Kontrol mute/unmute & leave call selalu terlihat meski pengguna berpindah channel text lain.  2. Status 'sedang di voice channel' tampil pada Channel Sidebar. |
| **Dependency** | FE12.1, FE8.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 9 jam |
| **Definition of Done** | Voice channel berfungsi end-to-end dari sisi UI sesuai FR-VV-01. |

**Subtask:**
- Bangun komponen docked voice control bar.
- Implementasikan join/leave/mute/unmute terhubung ke LiveKit Client.
- Sinkronisasikan status voice ke Presence store & Channel Sidebar.

**Checklist Verifikasi:**
- Voice control bar tetap terlihat saat navigasi channel lain
- Daftar peserta voice channel tampil realtime di sidebar

## Feature S14 — Video Channel UI

**FE14.1 — Grid Video & Kontrol Kamera**
| **Deskripsi** | UI grid peserta video dengan voice activity indicator, kontrol kamera on/off, dan penanganan error koneksi. |
| --- | --- |
| **Acceptance Criteria** | 1. Peserta yang sedang berbicara ter-highlight (voice activity indicator).  2. Error koneksi LiveKit ditampilkan sebagai banner/toast eksplisit, bukan silent failure. |
| **Dependency** | FE13.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Video channel berfungsi end-to-end dari sisi UI sesuai FR-VV-02. |

**Subtask:**
- Bangun komponen grid video responsif berdasar jumlah peserta.
- Implementasikan kontrol kamera on/off.
- Implementasikan voice activity indicator & penanganan error koneksi.

**Checklist Verifikasi:**
- Kamera on/off tidak memutus audio
- Error koneksi tampil jelas ke pengguna dengan opsi retry

# EPIC 6 — Advanced Messaging & Security (v0.6)

## Feature S15 — Forum/Announcement & Thread UI

**FE15.1 — Tampilan Forum/Announcement & Panel Thread**
| **Deskripsi** | View khusus untuk channel tipe Forum & Announcement, serta panel Thread terpisah di sisi kanan sesuai UI/UX Specification. |
| --- | --- |
| **Acceptance Criteria** | 1. Channel Announcement menampilkan Composer disabled bagi member tanpa izin menulis.  2. Thread dibuka sebagai panel di sisi kanan tanpa mengganti Message List utama. |
| **Dependency** | FE6.1, FE4.1 |
| **Priority** | Should |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Forum, Announcement, dan Thread berfungsi dari sisi UI sesuai FR-WS-03 & FR-MSG-02. |

**Subtask:**
- Bangun view khusus channel Forum (daftar topik) & Announcement.
- Bangun komponen Thread Panel dengan Message List mini di dalamnya.
- Terapkan disabled state Composer sesuai permission.

**Checklist Verifikasi:**
- Composer ter-disable otomatis tanpa izin MANAGE/SEND pada Announcement
- Thread panel dapat dibuka/ditutup tanpa kehilangan posisi scroll channel utama

## Feature S16 — Poll, Forward, Embed UI

**FE16.1 — Komponen Poll (Single & Multiple Choice)**
| **Deskripsi** | UI pembuatan polling dan tampilan hasil vote realtime, mendukung mode single & multiple choice. |
| --- | --- |
| **Acceptance Criteria** | 1. Toggle allowMultipleChoice tersedia saat membuat poll.  2. UI vote menyesuaikan (radio vs checkbox) berdasarkan mode poll. |
| **Dependency** | FE6.1 |
| **Priority** | Could |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Poll berfungsi dari sisi UI sesuai FR-MSG-07 dengan dukungan multiple-choice. |

**Subtask:**
- Bangun form pembuatan poll (pertanyaan, opsi, toggle multiple choice).
- Bangun komponen tampilan poll dengan hasil persentase realtime.
- Implementasikan aksi vote sesuai mode single/multiple.

**Checklist Verifikasi:**
- Single-choice poll hanya mengizinkan satu pilihan aktif per user di UI
- Multiple-choice poll mengizinkan lebih dari satu pilihan aktif per user di UI

**FE16.2 — Modal Forward & Embed Preview**
| **Deskripsi** | Modal pemilihan channel tujuan untuk forward pesan, dan komponen tampilan preview embed link. |
| --- | --- |
| **Acceptance Criteria** | 1. Modal forward hanya menampilkan channel tujuan yang pengguna miliki akses tulis.  2. Embed preview menampilkan metadata (judul/deskripsi/gambar) tanpa merender iframe eksternal. |
| **Dependency** | FE15.1 |
| **Priority** | Could |
| **Estimasi Kesulitan** | Easy |
| **Estimasi Waktu** | 6 jam |
| **Definition of Done** | Forward & Embed berfungsi dari sisi UI sesuai FR-MSG-05/08. |

**Subtask:**
- Bangun modal pemilihan channel tujuan forward.
- Bangun komponen embed preview card dari metadata API.
- Tangani state loading/error saat fetch metadata embed.

**Checklist Verifikasi:**
- Channel tanpa izin tulis tidak muncul sebagai opsi forward
- Embed preview tampil rapi tanpa merender konten eksternal aktif

## Feature S17 — Keamanan pada Sisi Frontend

**FE17.1 — Integrasi Keamanan Auth & Feedback Rate Limit**
| **Deskripsi** | Penanganan forced logout saat sesi di-revoke/suspend, serta feedback UI saat terkena rate limit atau CSRF check gagal. |
| --- | --- |
| **Acceptance Criteria** | 1. Response 401 akibat sesi di-revoke/suspend memaksa logout & redirect ke /login dengan pesan jelas.  2. Response 429 menampilkan toast dengan estimasi waktu coba lagi (dari header Retry-After). |
| **Dependency** | FE1.2, FE2.1 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 6 jam |
| **Definition of Done** | Frontend patuh terhadap seluruh kontrol keamanan yang relevan pada Security Design (Fase 6). |

**Subtask:**
- Tangani response 401 global di HTTP client wrapper (forced logout).
- Tangani response 429 dengan toast & countdown Retry-After.
- Pastikan permintaan berbasis cookie (refresh/logout) menyertakan header kustom sesuai Security Design (CSRF).

**Checklist Verifikasi:**
- Sesi yang di-suspend admin langsung logout otomatis di sisi client
- Toast rate limit menampilkan estimasi waktu tunggu yang benar

# EPIC 7 — Admin & Launch Polish (v0.7)

## Feature S18 — Admin Panel UI

**FE18.1 — UI Manajemen User & Audit Log Viewer**
| **Deskripsi** | Halaman Admin Panel dengan tabel user (aksi suspend/unsuspend) dan tabel audit log dengan filter, termasuk UI konfirmasi untuk operasi bulk. |
| --- | --- |
| **Acceptance Criteria** | 1. Halaman hanya dapat diakses/muncul di navigasi bagi is_platform_admin.  2. Aksi destruktif (suspend, bulk delete/kick) selalu melalui modal konfirmasi dengan ringkasan dampak. |
| **Dependency** | FE1.2, FE4.2 |
| **Priority** | Must |
| **Estimasi Kesulitan** | Hard |
| **Estimasi Waktu** | 10 jam |
| **Definition of Done** | Admin Panel berfungsi penuh dari sisi UI sesuai FR-ADM-01/02. |

**Subtask:**
- Bangun tabel daftar user dengan aksi suspend/unsuspend & pencarian.
- Bangun tabel audit log dengan filter aktor/aksi/rentang waktu.
- Bangun UI operasi bulk (pilih banyak item + modal konfirmasi ringkasan dampak).

**Checklist Verifikasi:**
- Menu Admin Panel disembunyikan total dari user non-admin
- Modal konfirmasi bulk menampilkan ringkasan item yang akan terdampak sebelum eksekusi

## Feature S19 — PWA & Responsive Polish

**FE19.1 — Registrasi PWA & Install Prompt**
| **Deskripsi** | Registrasi service worker, manifest.json, dan UI prompt instalasi PWA sesuai UI/UX Specification Bagian 6. |
| --- | --- |
| **Acceptance Criteria** | 1. Prompt install PWA muncul pada browser yang mendukung.  2. Halaman fallback offline tampil saat aplikasi dibuka tanpa koneksi. |
| **Dependency** | FE1.1 |
| **Priority** | Should |
| **Estimasi Kesulitan** | Easy |
| **Estimasi Waktu** | 5 jam |
| **Definition of Done** | Aplikasi installable sebagai PWA dari sisi frontend. |

**Subtask:**
- Tambahkan manifest.json & ikon PWA.
- Registrasikan service worker untuk caching aset statis.
- Bangun UI custom install prompt & halaman fallback offline.

**Checklist Verifikasi:**
- Aplikasi dapat di-install sebagai PWA
- Halaman fallback offline tampil saat tidak ada koneksi

**FE19.2 — Polish Responsif Seluruh Breakpoint**
| **Deskripsi** | Audit & perbaikan tampilan pada breakpoint mobile (<768px), tablet (768-1023px), dan desktop (>=1024px) sesuai UI/UX Specification Bagian 6. |
| --- | --- |
| **Acceptance Criteria** | 1. Tidak ada elemen UI terpotong/tumpang tindih pada ketiga breakpoint.  2. Navigasi mobile (bottom nav + single pane) berfungsi penuh menggantikan layout 3 kolom desktop. |
| **Dependency** | Seluruh fitur UI sebelumnya (FE1-FE18) |
| **Priority** | Should |
| **Estimasi Kesulitan** | Medium |
| **Estimasi Waktu** | 8 jam |
| **Definition of Done** | Frontend responsif penuh, menandai selesainya seluruh Task Checklist Frontend. |

**Subtask:**
- Audit tampilan seluruh halaman utama pada 3 breakpoint.
- Perbaiki komponen yang belum responsif (Message List, Sidebar, Modal).
- Implementasikan Bottom Navigation untuk mobile.

**Checklist Verifikasi:**
- Seluruh halaman utama diuji manual pada 3 breakpoint tanpa cacat visual
- Bottom navigation berfungsi penuh di mobile

# Keputusan yang Telah Diambil

- Task Checklist Frontend dibuat terpisah dari Backend namun mengikuti Epic/Feature yang identik, agar kedua tim/peran (bila dikerjakan solo, kedua "topi") tetap sinkron per sprint yang sama.
- State management dibagi dua: TanStack Query untuk server state (data dari API), Zustand untuk client state (auth token in-memory, UI toggle, presence cache).
- WebSocket client dibangun sebagai satu hook terpusat (useWebSocket, FE5.1) yang menjadi sumber event tunggal bagi seluruh fitur realtime (messaging, presence, notifikasi, voice status), bukan koneksi terpisah per fitur.
- Halaman Admin Panel disembunyikan total dari navigasi (bukan hanya disabled) bagi non-admin, konsisten dengan keputusan UI/UX Specification & Security Design.

# Keputusan yang Masih Perlu Dikonfirmasi

- Apakah dibutuhkan library form terpisah (mis. React Hook Form) untuk form kompleks (create role, create poll), atau cukup mengelola state form secara manual dengan useState/Zustand mengingat scope proyek pembelajaran ini.
- Apakah komponen UI mengikuti library headless (mis. Radix UI) sebagai fondasi aksesibilitas (FE Task terkait modal/dropdown), atau dibangun manual dari nol sesuai token TailwindCSS.

# Risiko Desain

- FE6.1 (Message List & Composer) dan FE4.2 (Role & Permission UI) memiliki Estimasi Kesulitan "Hard" dan volume state terbanyak (optimistic UI, infinite scroll, permission matrix) — berisiko menjadi bottleneck sprint bila tidak dipecah lebih lanjut saat implementasi.
- Karena WebSocket client (FE5.1) menjadi sumber tunggal seluruh event realtime, bug pada hook ini berdampak luas ke banyak fitur (chat, presence, notifikasi, voice status) sekaligus — perlu pengujian manual yang cukup menyeluruh setiap kali hook ini diubah.

# Technical Debt yang Sengaja Diterima

- Belum ada automated test frontend (unit test komponen maupun E2E) pada Task manapun di dokumen ini, konsisten dengan keputusan Development Roadmap/Sprint Breakdown bahwa pengujian mengandalkan verifikasi manual sepanjang proyek.
- Storybook atau katalog komponen terpisah belum menjadi bagian Task manapun; komponen didokumentasikan cukup melalui UI/UX Specification (Fase 7), bukan tooling katalog komponen tambahan.

# Pertanyaan untuk Stakeholder

- Apakah Task Checklist Frontend ini sudah dianggap lengkap dan selaras dengan Task Checklist Backend sebelumnya, sehingga kedua checklist siap dijadikan acuan implementasi bersama-sama per sprint?
