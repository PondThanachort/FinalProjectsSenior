"use client";

import { FOOTER_COLS, PROCESS_STEPS, SERVICES, SLIDES, WHY_CARDS } from "@/components/data/homeData";
import ProjectCard from "@/components/home/ProjectCard";
import { fmtProjectDate, useHomePage } from "@/components/home/useHomePage";
import SlideIllustration from "@/components/ui/SlideIllustration";
export default function HomePage() {
  const {
    slide,
    playing,
    progress,
    searchQuery,
    setSearchQuery,
    allProjectsOpen,
    setAllProjectsOpen,
    allProjectsSearch,
    setAllProjectsSearch,
    mobileMenuOpen,
    setMobileMenuOpen,
    detailProject,
    detailImages,
    detailLoading,
    detailFromAllProjects,
    galleryIndex,
    setGalleryIndex,
    filteredProjects,
    previewProjects,
    showAllProjectsButton,
    allProjectsFiltered,
    togglePlay,
    navScrolled,
    goTo,
    moveGallery,
    openProjectDetail,
    closeProjectDetail,
    openProjectFromAll,
    backToAllProjects,
  } = useHomePage();
  return (
    <>
      <nav className={`navbar ${navScrolled ? "scrolled" : "top"}`}>
        <a href="#hero" className="nav-logo-wrap">
          <img src="/logo.jpg" alt="Suwan logo" className="nav-logo-img" />
          <div>
            <div className="nav-brand-name">Suwan</div>
            <div className="nav-brand-sub">Interior & Renovation</div>
          </div>
        </a>
        <ul className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {["หน้าแรก", "เกี่ยวกับเรา", "บริการ", "ผลงาน", "ติดต่อเรา"].map((name, index) => (
            <li key={name}>
              <a
                href={`#${["hero", "about", "services", "projects", "contact"][index]}`}
                className={index === 0 ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: "none" }}
            type="button"
          >
            <span/><span/><span/>
          </button>
          <a href="/login" className="nav-btn">เข้าสู่ระบบ</a>
        </div>
      </nav>

      <section className="hero" id="hero">
        {SLIDES.map((item, index) => (
          <div
            key={item.id}
            className={`slide-layer ${index === slide ? "visible" : "hidden"}`}
            style={{ background: item.gradient }}
          >
            <SlideIllustration id={item.id} />
          </div>
        ))}

        <div className="hero-content">
          <div key={slide} className="fade-hero" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="hero-title">{SLIDES[slide].title}</div>
            <div className="hero-subtitle">{SLIDES[slide].subtitle}</div>
          </div>

          <div className="hero-stats">
            {[["★", "10+", "ปีประสบการณ์"], ["✓", "50+", "ลูกค้าพึงพอใจ"], ["◆", "50+", "โครงการสำเร็จ"]].map(([icon, value, label]) => (
              <div className="stat" key={label}>
                <span className="stat-icon">{icon}</span>
                <span className="stat-val">{value}</span>
                <span className="stat-lbl">{label}</span>
              </div>
            ))}
          </div>

          <div className="hero-ctas">
            <a href="#projects" className="cta-white">ดูผลงานของเรา <span>→</span></a>
            <a href="#contact" className="cta-ghost">ติดต่อเรา</a>
          </div>
        </div>

        <div className="slide-controls">
          <button className="play-btn" onClick={togglePlay} type="button">
            {playing ? (
              <svg width="13" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="13" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>
          <div className="dots">
            {SLIDES.map((_, index) => (
              <button key={index} className="dot-btn" onClick={() => goTo(index)} type="button">
                <div className={`dot${index === slide ? " active" : ""}`}>
                  {index === slide && <div className="dot-fill" style={{ transform: `scaleX(${progress / 100})`, transition: playing ? "transform 0.1s linear" : "none" }}/>}
                </div>
              </button>
            ))}
          </div>
          <span className="slide-counter">{String(slide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}</span>
        </div>
      </section>

      <section className="services-section section-wrap" id="services">
        <div className="services-inner">
          <div>
            <div className="section-label-sm sr">บริการของเรา</div>
            <h2 className="section-title sr">ครบทุกด้าน<br/>ในหนึ่งทีม</h2>
            <p className="section-desc sr" style={{ marginBottom: 0 }}>
              ตั้งแต่ไอเดียแรกจนถึงวันส่งมอบ เราดูแลทุกขั้นตอนด้วยทีมงานมืออาชีพ
            </p>
            <div className="why-cards sr" style={{ marginTop: 32 }}>
              {WHY_CARDS.map((card, index) => (
                <div className="why-card" key={index}>
                  <div className="why-card-icon">{card.icon}</div>
                  <div className="why-card-title">{card.title}</div>
                  <div className="why-card-desc">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="services-list">
              {SERVICES.map((service, index) => (
                <div key={index} className={`service-item sr sr-d${index}`}>
                  <div className="svc-num">{service.num}</div>
                  <div>
                    <div className="svc-title">{service.icon} {service.title}</div>
                    <div className="svc-desc">{service.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="projects-section section-wrap" id="projects">
        <div className="projects-header sr">
          <div>
            <div className="section-badge">ผลงานที่ผ่านมา</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>ผลงาน</h2>
          </div>
          {showAllProjectsButton && (
            <button type="button" className="view-all-btn" onClick={() => setAllProjectsOpen(true)}>ดูทั้งหมด →</button>
          )}
        </div>

        <div className="search-wrap sr">
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className="search-input"
            type="text"
            value={searchQuery}
            placeholder="ค้นหาโครงการ เช่น KWI, เชียงใหม่, Office..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery && <button className="search-clear" onClick={() => setSearchQuery("")} type="button">×</button>}
        </div>

        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {previewProjects.map((project) => (
              <ProjectCard key={project.id} p={project} onClick={() => openProjectDetail(project)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">⌕</div>
            <div className="empty-state-title">ไม่พบโครงการที่ตรงกัน</div>
            <div className="empty-state-desc">ลองค้นหาด้วยคำอื่น</div>
            <button className="empty-state-btn" onClick={() => setSearchQuery("")} type="button">ล้างการค้นหา</button>
          </div>
        )}

        {showAllProjectsButton && (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button type="button" className="view-all-btn sr" onClick={() => setAllProjectsOpen(true)}>ดูผลงานทั้งหมด →</button>
          </div>
        )}
      </section>

      <section className="process-section section-wrap" id="process">
        <div className="process-watermark">PROCESS</div>
        <div className="process-inner">
          <div className="process-header">
            <div className="section-badge sr">กระบวนการทำงาน</div>
            <h2 className="section-title sr">ทุกขั้นตอน ชัดเจน</h2>
            <p className="section-desc sr" style={{ margin: "0 auto" }}>
              เราออกแบบกระบวนการทำงานให้โปร่งใสและเข้าใจง่าย
            </p>
          </div>
          <div className="process-grid">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className={`process-step sr sr-d${index}`}>
                <div className="process-circle"><span className="process-step-num">{step.step}</span></div>
                <div className="process-name">{step.name}</div>
                <div className="process-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section section-wrap" id="about">
        <div className="about-inner">
          <div className="about-left">
            <div className="section-label-sm sr">เกี่ยวกับเรา</div>
            <h2 className="section-title sr">สร้างสรรค์<br/>ด้วยใจ</h2>
            <p className="section-desc sr">
              Suwan Interior & Renovation ก่อตั้งขึ้นด้วยความเชื่อว่าพื้นที่ที่ดีสามารถเปลี่ยนชีวิตได้
              เราทำงานด้วยความละเอียดรอบคอบ ใส่ใจทุกรายละเอียด
            </p>
            <div className="team-row sr">
              {[["12+", "สถาปนิก"], ["8+", "ดีไซเนอร์"], ["20+", "วิศวกร"]].map(([number, label]) => (
                <div key={label}>
                  <div className="team-stat-num">{number}</div>
                  <div className="team-stat-lbl">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-right">
            <div>
              <h2 className="sr" style={{ fontFamily: "'Noto Serif Thai',serif", fontSize: "clamp(28px,3.2vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                มาสร้างความฝัน<br/>ด้วยกัน
              </h2>
              <p className="about-right-desc sr">
                ไม่ว่าจะเป็นบ้านในฝัน คอนโด ออฟฟิศ หรือโครงการขนาดใหญ่ เราพร้อมให้คำปรึกษาฟรี
              </p>
              <a href="#contact" className="consult-btn sr">นัดปรึกษาฟรี →</a>
            </div>
            <div className="testimonial-wrap sr">
              <div className="testimonial-stars">★★★★★</div>
              <div className="testimonial-text">&quot;Suwan เปลี่ยนออฟฟิศเก่าของเราให้กลายเป็นพื้นที่ทำงานที่ทีมรักมากที่สุด&quot;</div>
              <div className="testimonial-author">
                <div className="author-avatar">ส</div>
                <div>
                  <div className="author-name">คุณสมชาย</div>
                  <div className="author-role">CEO, KWI Group</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section section-wrap" id="contact">
        <div className="contact-inner">
          <div>
            <div className="section-label-sm sr" style={{ color: "rgba(255,255,255,.4)" }}>ติดต่อเรา</div>
            <h2 className="contact-title sr">เริ่มต้น<br/>โครงการของคุณ</h2>
            <p className="contact-desc sr">ให้ทีมผู้เชี่ยวชาญของเราช่วยออกแบบและสร้างพื้นที่ในฝันของคุณ</p>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }} className="sr">
              {[["ที่อยู่", "ลำพูน, ประเทศไทย"], ["โทร", "+66 89 809 4354"], ["อีเมล", "suwannakorn62@gmail.com"], ["Line", "0826152905"]].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "center", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                  <span style={{ color: "#52b788", fontWeight: 700 }}>{label}</span>{value}
                </div>
              ))}
            </div>
          </div>
          <div className="contact-form sr">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ชื่อ</label>
                <input className="form-input" placeholder="ชื่อของคุณ"/>
              </div>
              <div className="form-group">
                <label className="form-label">เบอร์โทร</label>
                <input className="form-input" placeholder="08X-XXX-XXXX"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input className="form-input" placeholder="email@example.com"/>
            </div>
            <div className="form-group">
              <label className="form-label">ประเภทโครงการ</label>
              <select className="form-input" style={{ appearance: "none" }}>
                {["เลือกประเภทโครงการ", "ออกแบบตกแต่งภายใน", "สถาปัตยกรรม", "งานก่อสร้าง", "ครบวงจร"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">รายละเอียดโครงการ</label>
              <textarea className="form-input form-textarea" placeholder="เล่าให้เราฟังเกี่ยวกับโครงการของคุณ..."/>
            </div>
            <button className="form-submit" type="button">ส่งข้อความ →</button>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand"><span>Suwan</span> Interior & Renovation</div>
            <p className="footer-tagline">ออกแบบตกแต่งภายใน สถาปัตยกรรม และก่อสร้าง ด้วยมาตรฐานระดับสากล</p>
            {/* <div className="footer-socials">
              {["FB", "IG", "LN", "YT"].map((item) => <div key={item} className="social-btn">{item}</div>)}
            </div> */}
          </div>
          {FOOTER_COLS.map((column, index) => (
            <div key={index}>
              <div className="footer-heading">{column.h}</div>
              <ul className="footer-links">
                {column.links.map((link) => <li key={link}><a href="#">{link}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2024 Suwan Interior & Renovation. All rights reserved.</div>
          <div className="footer-copy">ออกแบบด้วยใจ เพื่อทุกความฝัน</div>
        </div>
      </footer>

      {allProjectsOpen && (
        <div className="home-all-projects-overlay" onClick={(event) => { if (event.target === event.currentTarget) setAllProjectsOpen(false); }}>
          <div className="home-all-projects-modal">
            <div className="home-all-projects-head">
              <div>
                <div className="home-project-kicker">All Projects</div>
                <h3>ผลงานทั้งหมด</h3>
                <p>แสดงโครงการที่เสร็จสิ้นทั้งหมดจากฐานข้อมูล</p>
              </div>
              <button type="button" className="home-project-close home-all-projects-close" onClick={() => setAllProjectsOpen(false)} aria-label="Close projects list">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="home-all-projects-search">
              <span className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="search-input"
                type="text"
                value={allProjectsSearch}
                placeholder="ค้นหาโครงการ, สถานที่, ผู้รับผิดชอบ..."
                onChange={(event) => setAllProjectsSearch(event.target.value)}
                autoFocus
              />
              {allProjectsSearch && <button className="search-clear" onClick={() => setAllProjectsSearch("")} type="button">×</button>}
            </div>

            {allProjectsFiltered.length > 0 ? (
              <div className="home-all-projects-grid">
                {allProjectsFiltered.map((project) => (
                  <ProjectCard key={project.id} p={project} onClick={() => openProjectFromAll(project)} />
                ))}
              </div>
            ) : (
              <div className="empty-state home-all-projects-empty">
                <div className="empty-state-icon">⌕</div>
                <div className="empty-state-title">ไม่พบโครงการที่ตรงกัน</div>
                <div className="empty-state-desc">ลองค้นหาด้วยชื่อโครงการ สถานที่ หรือผู้รับผิดชอบอื่น</div>
                <button className="empty-state-btn" onClick={() => setAllProjectsSearch("")} type="button">ล้างการค้นหา</button>
              </div>
            )}
          </div>
        </div>
      )}

      {detailProject && (
        <div className="home-project-overlay" onClick={(event) => { if (event.target === event.currentTarget) closeProjectDetail(); }}>
          <div className="home-project-modal">
            {detailFromAllProjects && (
              <button type="button" className="home-project-back" onClick={backToAllProjects} aria-label="Back to all projects">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/><line x1="9" y1="12" x2="21" y2="12"/></svg>
                ย้อนกลับ
              </button>
            )}
            <button type="button" className="home-project-close" onClick={closeProjectDetail} aria-label="Close project detail">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="home-project-hero">
              {detailProject.image ? <img src={detailProject.image} alt={detailProject.name} /> : <div className="home-project-image-empty">Project</div>}
            </div>

            <div className="home-project-content">
              <div className="home-project-heading">
                <div>
                  <div className="home-project-kicker">Project Detail</div>
                  <h3>{detailProject.name}</h3>
                  <p className="home-project-credit">
                    ภาพประกอบใช้เพื่อจัดทำโปรเจกต์การศึกษาเท่านั้น เครดิตรูปภาพทั้งหมดเป็นของ{" "}
                    <a href="https://www.clouddesign.co.th/" target="_blank" rel="noopener noreferrer">Clouddesign</a>
                  </p>
                </div>
                {detailProject.status && <span className="home-project-status">{detailProject.status}</span>}
              </div>

              <div className="home-project-info-grid">
                <div><span>สถานที่</span><strong>{detailProject.location || "-"}</strong></div>
                <div><span>เริ่มต้น</span><strong>{fmtProjectDate(detailProject.startDate)}</strong></div>
                <div><span>สิ้นสุด</span><strong>{fmtProjectDate(detailProject.endDate)}</strong></div>
                <div><span>ผู้รับผิดชอบ</span><strong>{detailProject.staff || "-"}</strong></div>
              </div>

              <div className="home-project-description">
                <span>รายละเอียดโครงการ</span>
                <p>{detailProject.description || "-"}</p>
              </div>

              {(detailLoading || detailImages.length > 0) && (
                <div className="home-project-gallery-block">
                  <div className="home-project-gallery-title">ภาพผลงานโครงการ</div>
                  {detailLoading ? (
                    <div className="home-project-loading">กำลังโหลดรูปภาพ...</div>
                  ) : (
                    <div className="home-project-gallery">
                      {detailImages.slice(0, 4).map((image, index) => {
                        const hasMore = index === 3 && detailImages.length > 4;
                        return (
                          <button type="button" className="home-project-gallery-item" key={`${image}-${index}`} onClick={() => setGalleryIndex(index)}>
                            <img src={image} alt={`${detailProject.name} ${index + 1}`} />
                            {hasMore && <span>+{detailImages.length - 3}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {detailProject && galleryIndex !== null && detailImages[galleryIndex] && (
        <div className="home-gallery-lightbox" onClick={() => setGalleryIndex(null)}>
          <button type="button" className="home-gallery-close" onClick={() => setGalleryIndex(null)} aria-label="Close image">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button type="button" className="home-gallery-nav home-gallery-prev" onClick={(event) => { event.stopPropagation(); moveGallery(-1); }} aria-label="Previous image">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button type="button" className="home-gallery-nav home-gallery-next" onClick={(event) => { event.stopPropagation(); moveGallery(1); }} aria-label="Next image">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="home-gallery-stage" onClick={(event) => event.stopPropagation()}>
            <img src={detailImages[galleryIndex]} alt={`${detailProject.name} image ${galleryIndex + 1}`} />
            <div className="home-gallery-caption">
              <strong>{detailProject.name}</strong>
              <span>{galleryIndex + 1} / {detailImages.length}</span>
            </div>
          </div>
        </div>
      )}

      <button className="chat-fab" type="button" aria-label="Open chat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </>
  );
}
