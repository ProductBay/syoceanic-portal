// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Fade-in body on load
    document.body.classList.add('loaded');

    // Scroll-triggered section fade-ins
    const sections = document.querySelectorAll('.section');
    const observerOptions = { threshold: 0.2 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Optional: Fade-out before navigating to a new page
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if(link.target !== "_blank" && link.href.includes(window.location.origin)){
            link.addEventListener('click', function(e){
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location = link.href;
                }, 600);
            });
        }
    });
});
