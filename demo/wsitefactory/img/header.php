<?php
/**
 * @package WordPress
 * @subpackage Yoko
 */
function the_page_header(){
	$postContent = get_post_field( 'post_content',null );
    $content_parts = get_extended( $postContent );
    if(!empty($content_parts['extended']) &&  !($post->post_parent)){
        $beforeMode = $content_parts['main']; //content before more
        $imageUrl=get_the_post_thumbnail_url(null);
    	$headerPage = '<div class="article-header">';
    	$headerPage .= '<div class="article-header-image" style="background-image:url('.$imageUrl.')"> </div>';
    	$headerPage .= '<h1 class="article-header-title">'.get_the_title().'</h1>';
    	$headerPage .= '<span class="article-header-date">'.get_the_date().'</span>';
    	$headerPage .= '<p class="article-header-summary">';
        /*$headerPage .= get_extended( $content );*/
        $headerPage .= $content_parts['main'];
    	$headerPage .= '</p></div>';
    	echo $headerPage;
	}

}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
	<title><?php wp_title( '|', true, 'right' ); ?></title>
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<!--[if lt IE 9]>
	<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
	<![endif]-->
	<?php wp_head();
	$locationJs=get_bloginfo('url')."/dist/w-siteFactory.min.js?ver=1.0";
	$locationcss=get_bloginfo('url')."/dist/styles/css/w-siteFactory.min.css?ver=1.0";
	?>
	<script src="<?php echo get_bloginfo('url'); ?>/libs/jquery-iframe-auto-height.min.js" type="text/javascript"></script>
    <script>
    jQuery(document).ready(function(){
        jQuery('iframe.hauteur-auto').iframeAutoHeight({minHeight: 360});
        
        $window = jQuery(window);
        var resizeTimer;
        $window.on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                $window.trigger('resizeDone');
            }, 100);
        });
        $window.on('resizeDone', function () {
            jQuery('iframe.hauteur-auto').iframeAutoHeight({minHeight: 360});
        });
    });
    </script>
</head>

<body <?php body_class(); ?>>
<div id="page" class="clearfix">
	<header id="branding">
			<?php global $yoko_options;
		$yoko_settings = get_option( 'yoko_options', $yoko_options ); ?>
        <?php $logo=$yoko_settings['custom_logo'];
        if($logo) : ?>
		<hgroup id="site-title">
		<?php if( $yoko_settings['custom_logo'] ) : ?>
			<a href="<?php echo home_url( '/' ); ?>" class="logo"><img src="<?php echo $yoko_settings['custom_logo']; ?>" alt="<?php bloginfo('name'); ?>" /></a>
		<?php else : ?>
			<h1><a href="<?php echo home_url( '/' ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>"><?php bloginfo( 'name' ); ?></a></h1>
		<?php endif; ?>
		<h2 id="site-description"><?php bloginfo( 'description' ); ?></h2>
		</hgroup><!-- end site-title -->
        <?php endif; ?>
        <?php
		// The header image
		// Check if this is a post or page, if it has a thumbnail, and if it's a big one
			if ( is_singular() &&
				current_theme_supports( 'post-thumbnails' ) &&
				has_post_thumbnail( $post->ID ) &&
				( /* $src, $width, $height */ $image = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'post-thumbnail' ) ) &&
				$image[1] >= HEADER_IMAGE_WIDTH ) :
				// Houston, we have a new header image!
						echo get_the_post_thumbnail( $post->ID , array(1102,350), array('class' => 'headerimage'));
						elseif ( get_header_image() ) : ?>
						<img src="<?php header_image(); ?>" class="headerimage" width="<?php echo HEADER_IMAGE_WIDTH; ?>" height="<?php echo HEADER_IMAGE_HEIGHT; ?>" alt="" /><!-- end headerimage -->
					<?php endif; ?>
					<div class="clear"></div>
    <a id="top-page"></a>
    <?php the_page_header(); ?>
	<nav id="mainnav" class="clearfix">
			<?php wp_nav_menu( array( 'theme_location' => 'primary' ,'menu_class' => 'menu sf-responsive-topnav sf-770' )); ?>
		</nav><!-- end mainnav -->

		<nav id="subnav">
			<?php
			if (is_nav_menu( 'Sub Menu' ) ) {
			wp_nav_menu( array('menu' => 'Sub Menu' ));} ?>
		</nav><!-- end subnav -->
</header><!-- end header -->