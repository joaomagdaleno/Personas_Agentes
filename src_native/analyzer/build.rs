fn main() -> Result<(), Box<dyn std::error::Error>> {
    let protoc_path = protoc_bin_vendored::protoc_bin_path()?;
    unsafe {
        std::env::set_var("PROTOC", protoc_path);
    }
    tonic_build::configure()
        .compile_protos(
            &["../hub/proto/hub.proto"],
            &["../hub/proto"],
        )?;
    Ok(())
}
