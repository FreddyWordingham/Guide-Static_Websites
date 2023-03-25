const SHADER = `#define detail .00001
                #define t time*.1
                vec3 lightdir = normalize(vec3(0.5,-0.4,-1.));
                float det = 0.0;


                vec4 formula (vec4 p) {
                        if (abs(p.x)>1.4)
                        return p;
                    float z = fract(sin(floor(p.z)))/10.;
                    float z1 = z + fract(cos(floor(p.z*2.)))/30.;
                    p.z = fract(p.z);

                    for (int i=0; i<6; i++) {
                        p.xyz = abs(p.xyz) - vec3(.0, z, .0);
                        p = p*2.2/clamp(dot(p.xyz,p.xyz), z1, min(1.3 * t, 1.2)-z1)
                            - vec4( 0.8, 2.4+z/5., 0.55, 0.0);
                    }
                    return p;
                }

                float texture2 (vec3 p) {
                    if (abs(p.x)>0.99)
                        return 0.;
                    float z = p.z/2.;
                    p=formula(vec4(p,0.)).xyz;
                    return cos(z)*0.5+clamp(pow(max(0.,max(abs(p.x),abs(p.z))),1.6),.0,1.);
                }

                vec2 de(vec3 pos) {
                    if (abs(pos.x)>1.)
                        return vec2(0.,0.);
                    vec4 p = vec4(pos, 1.);
                    p = formula(p);
                    float fr=length(p.zx)/p.w-.002;
                    return vec2(fr,0.);
                }

                vec3 normal(vec3 p) {
                    vec3 e = vec3(0.0,det,0.0);
                    return normalize(vec3(
                            de(p+e.yxx).x-de(p-e.yxx).x,
                            de(p+e.xyx).x-de(p-e.xyx).x,
                            de(p+e.xxy).x-de(p-e.xxy).x)
                    );
                }

                vec3 light(in vec3 p, in vec3 dir, in vec3 n, in float hid) {
                    float diff = max(0.,dot(lightdir,-n));
                    vec3 amb = max(.6,dot(dir,-n))*.7*vec3(1.);
                    float k=texture2(p);
                    vec3 col=mix(vec3(k,k*k,k*k*k)*.8+.2, vec3(k)*.5, sin(p.z)*0.5+0.5);
                    return col*(amb+diff);
                }

                vec3 raymarch(in vec3 from, in vec3 dir) {
                    float totdist;
                    vec2 d = vec2(1e5,0.);
                    vec3 p, col;
                    for (int i=0; i<99; i++) {
                        if (d.x>det && totdist<16.0) {
                            p=from+totdist*dir;
                            d=de(p);
                            det=detail*(1.+totdist*60.);
                            totdist+=max(detail,d.x);
                        }
                    }
                    p=from+dir*(totdist-detail);
                    if (d.x<.01) {
                        vec3 norm=normal(p);
                        col=light(p-abs(d.x-det)*dir, dir, norm, d.y);
                    }
                    return col;
                }

                void main() {
                    vec2 uv = gl_FragCoord.xy / resolution.xy * 2.0 - 1.0;
                    uv.y *= resolution.y/resolution.x;
                    vec3 eye = vec3(0.0, -1.62 * sin(t), 4.0 * -t);
                    vec3 dir = normalize(vec3(gl_FragCoord.xy - resolution.xy * 0.5, -resolution.y));
                    vec3 col = raymarch(eye, dir);
                    gl_FragColor = vec4(col, 1.);
                }
            `;

// Adapted from https://raw.githack.com/strangerintheq/rgba/0.0.8/rgba.js
const render = (mainCode, props) => {
    // shaders
    let config = prepareConfig(props);
    let canvas = config.target || document.createElement("canvas");
    let gl = (this.gl = canvas.getContext("webgl"));
    let program = gl.createProgram();
    [config.vertexShader, config.fragmentShader].forEach(createShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // uniforms
    let frameCallbacks = config.frame ? [config.frame] : [];
    Object.keys(config.uniforms).forEach(handleUniform);
    handleTextures();

    // vertices
    let triangle = new Float32Array([-1, 3, -1, -1, 3, -1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);
    let vert = gl.getAttribLocation(program, "vert");
    gl.vertexAttribPointer(vert, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vert);

    const handleSize = () => {
        const w = canvas.clientWidth | 0;
        const h = canvas.clientHeight | 0;
        if (config.size[0] === w && config.size[1] === h) return;
        config.size = [(canvas.width = w), (canvas.height = h)];
        config.width = canvas.width = w;
        config.height = canvas.height = h;
        gl.viewport(0, 0, ...config.size);
        this.resolution(config.size);
    };

    if (!config.target) {
        document.body.appendChild(canvas);
        if (false === config.fullscreen) return;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
    }

    if (false !== config.loop) {
        const drawFrame = (t) => {
            handleSize();
            this.time(t / 1000);
            frameCallbacks.forEach((cb) => cb(t));
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            window.capturer && window.capturer.capture(canvas);
            requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function detectUniformType(uf, cfg) {
        let name = cfg.uniforms[uf];
        let isFunc = typeof name === "function";
        if (isFunc) name = (Array.isArray(name(0)) ? name(0).length : 1) + "f";
        return { name, isFunc, isArray: "1f" !== name };
    }

    function handleUniform(uf) {
        let loc = gl.getUniformLocation(program, uf);
        let type = detectUniformType(uf, config);
        let setter = gl[`uniform${type.name}`];
        this[uf] = type.isArray ? (v) => setter.call(gl, loc, ...v) : (v) => setter.call(gl, loc, v);
        if (!type.isFunc) return;
        let val;
        frameCallbacks.push((t) => {
            let newVal = config.uniforms[uf](val, t);
            this[uf]((val = newVal)); // todo compare values
        });
        this[uf]((val = config.uniforms[uf](0)));
    }

    function svgSupport(url) {
        if (url.indexOf("svg") > -1) {
            if (url.indexOf("xmlns") === -1) url = url.split("<svg ").join(`<svg xmlns="http://www.w3.org/2000/svg" `);
            return "data:image/svg+xml;base64," + btoa(url);
        }
        return url;
    }

    function createTexture(index, image) {
        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    function createFragmentShader(cfg) {
        cfg.fragmentShader =
            "\n" +
            Object.keys(cfg.uniforms)
                .map((uf) => {
                    let type = detectUniformType(uf, cfg).name[0];
                    return `uniform ${type - 1 ? "vec" + type : "float"} ${uf};`;
                })
                .join("\n") +
            "\n";
        if (cfg.textures && cfg.textures.length) cfg.fragmentShader += `\nuniform sampler2D tex[${cfg.textures.length}];\n`;
        cfg.fragmentShader += cfg.mainCode;
    }

    function prepareConfig(props) {
        let cfg = props || {};
        cfg.size = cfg.size || [0, 0];
        cfg.mainCode = mainCode;
        cfg.uniforms = cfg.uniforms || {};
        cfg.uniforms.time = "1f";
        cfg.uniforms.resolution = "2f";
        cfg.vertexShader = cfg.vertexShader || `attribute vec2 vert;\nvoid main(void) { gl_Position = vec4(vert, 0.0, 1.0);}`;
        if (cfg.mainCode.indexOf("void main()") === -1 && cfg.mainCode.indexOf("void main(void)") === -1) cfg.mainCode = `\nvoid main() {\n${cfg.mainCode}\n}`;
        if (!cfg.fragmentShader) createFragmentShader(cfg);
        if (cfg.fragmentShader.trim().indexOf("precision") !== 0) cfg.fragmentShader = `precision ${cfg.precision || "highp"} float;\n` + cfg.fragmentShader;
        return cfg;
    }

    function createShader(src, i) {
        let id = gl.createShader(i ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
        gl.shaderSource(id, src);
        gl.compileShader(id);
        let message = gl.getShaderInfoLog(id);
        if (message || config.debug) src.split("\n").map((line, i) => print(line, i, message));
        if (message) throw message;
        gl.attachShader(program, id);
    }

    function print(str, i, message) {
        if (!config.log) {
            config.log = document.createElement("div");
            config.log.style.fontFamily = "Courier New, monospace";
            document.body.append(config.log);
            canvas.remove();
        }
        let line = 1 + i;
        let currentLine = line === +message.split(":")[2];
        let msg = ("" + line).padStart(4, "0") + ": " + str.split(" ").join("&nbsp;");
        if (currentLine) msg = "<br>" + message + "<br>" + msg + "<br><br>";
        config.log.innerHTML += `<div ${currentLine && 'style="background:#900;color:#fff"'}>${msg}</div>`;
    }

    function handleTextures() {
        if (!config.textures) return;

        gl.uniform1iv(
            gl.getUniformLocation(program, "tex"),
            config.textures.map((_, i) => i)
        );

        config.textures.forEach((source, index) => {
            if (typeof source === "string") {
                let loader = new Image();
                loader.crossOrigin = "anonymous";
                loader.src = svgSupport(source);
                loader.onload = () => createTexture(index, loader);
            } else {
                createTexture(index, source);
            }
        });
    }
};

function slider(name, value = 0.5, min = 0, max = 1, step = 0.001) {
    if (!window.gui)
        document.body.innerHTML = `<div id="gui" 
        style="right:0;position: fixed;background:#0004;padding:10px;text-align: right"><div>`;
    const id = Math.random().toString(36).substring(2);
    window.gui.innerHTML += `
        <label style="color:white">${name}</label>
        <input style="vertical-align: middle" type=range id=slider_${id} min=${min} max=${max} value=${value} step=${step} >
        <label id="label_${id}" style="color:white"></label><br>
    `;
    return () => {
        const v = +window["slider_" + id].value;
        window["label_" + id].innerHTML = v.toFixed(4);
        return v;
    };
}
